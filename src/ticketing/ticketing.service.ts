import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import {
  CreateTicketInput,
  CreateTicketReplyInput,
  UpdateTicketInput,
  SearchTicketInput,
  CreateTicketDepartmentInput,
  UpdateTicketDepartmentInput,
} from './dto/ticket.input';
import { TicketStatus } from './models/ticket.model';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../common/enums/notification-type.enum';


@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.setContext('TicketingService');
  }

  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, data: CreateTicketInput) {
    try {
      const ticket = await this.prisma.ticket.create({
        data: {
          userId,
          subject: data.subject,
          message: data.message,
          priority: data.priority,
          department: data.department,
          reference: data.reference,
          attachments: data.attachments || [],
          status: TicketStatus.OPEN,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Notify admins about new ticket
      const adminIds = await this.getAdminUserIds();
      if (adminIds.length > 0) {
        await this.notificationService.sendNotificationToUsers(adminIds, {
          type: NotificationType.SYSTEM,
          title: 'New Support Ticket',
          message: `A new support ticket has been created: ${ticket.subject}`,
          link: `/admin/tickets/${ticket.id}`,
        });
      }

      return ticket;
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a ticket by ID
   */
  async getTicketById(id: string, userId: string, isAdmin: boolean = false) {
    try {
      // Build the query based on user role
      const where = {
        id,
        ...(isAdmin ? {} : { userId }), // If not admin, only show user's own tickets
      };

      const ticket = await this.prisma.ticket.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          replies: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      return ticket;
    } catch (error) {
      this.logger.error(`Error getting ticket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search tickets with pagination and filtering
   */
  async searchTickets(searchInput: SearchTicketInput, userId: string, isAdmin: boolean = false) {
    try {
      const { page, limit, status, priority, department, userId: searchUserId, assignedToId, search } = searchInput;
      const skip = (page - 1) * limit;

      // Build the where clause
      const where: any = {};

      // If not admin, only show user's own tickets
      if (!isAdmin) {
        where.userId = userId;
      } else if (searchUserId) {
        where.userId = searchUserId;
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (department) {
        where.department = department;
      }

      if (assignedToId) {
        where.assigneeId = assignedToId;
      }

      if (search) {
        where.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [tickets, totalCount] = await Promise.all([
        this.prisma.ticket.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            _count: {
              select: {
                replies: true,
              },
            },
          } as any,
        }),
        this.prisma.ticket.count({ where }),
      ]);

      return {
        tickets,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error searching tickets: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all tickets for a user
   */
  async getUserTickets(userId: string, searchInput: SearchTicketInput) {
    try {
      // Force the userId filter to the current user's ID
      searchInput.userId = userId;
      return this.searchTickets(searchInput, userId, false);
    } catch (error) {
      this.logger.error(`Error getting user tickets: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a ticket (admin only)
   */
  async updateTicket(id: string, data: UpdateTicketInput, adminId: string) {
    try {
      // Get the current ticket
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        } as any,
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // If status is changing to resolved or closed, add closedAt timestamp
      const updateData: any = { ...data };
      if (data.status === TicketStatus.RESOLVED || data.status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
      }

      // Update the ticket
      const updatedTicket = await this.prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

        } as any,
      });

      // Add a system message to the ticket
      if (data.status && data.status !== ticket.status) {
        await this.prisma.ticketReply.create({
          data: {
            ticketId: id,
            userId: adminId,
            message: `Status changed from ${ticket.status} to ${data.status}`,
            isFromStaff: true,
            attachments: [],
          },
        });
      }

      // If assigned to someone new, add a system message
      if (data.assignedToId && data.assignedToId !== (ticket as any).assignedToId) {
        const assignedTo = await this.prisma.user.findUnique({
          where: { id: data.assignedToId },
          select: { firstName: true, lastName: true },
        });

        if (assignedTo) {
          await this.prisma.ticketReply.create({
            data: {
              ticketId: id,
              userId: adminId,
              message: `Ticket assigned to ${assignedTo.firstName} ${assignedTo.lastName}`,
              isFromStaff: true,
              attachments: [],
            },
          });
        }
      }

      // Notify the user about status change
      if (data.status && data.status !== ticket.status) {
        await this.notificationService.sendNotificationToUsers([(ticket.user as any).id], {
          type: NotificationType.SYSTEM,
          title: 'Ticket Status Updated',
          message: `Your ticket "${ticket.subject}" has been updated to ${data.status}`,
          link: `/tickets/${id}`,
        });
      }

      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a ticket (admin or owner)
   */
  async deleteTicket(id: string, userId: string, isAdmin: boolean = false) {
    try {
      // Check if the ticket exists
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if the user has permission to delete
      if (!isAdmin && ticket.userId !== userId) {
        throw new Error('You do not have permission to delete this ticket');
      }

      // Delete the ticket
      await this.prisma.ticket.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting ticket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Add a reply to a ticket
   */
  async addTicketReply(userId: string, data: CreateTicketReplyInput, isStaff: boolean = false) {
    try {
      // Check if the ticket exists
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: data.ticketId },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        } as any,
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if the user has permission to reply (ticket owner or staff)
      if (!isStaff && ticket.userId !== userId) {
        throw new Error('You do not have permission to reply to this ticket');
      }

      // Create the reply
      const reply = await this.prisma.ticketReply.create({
        data: {
          ticketId: data.ticketId,
          userId,
          message: data.message,
          isFromStaff: isStaff,
          attachments: data.attachments || [],
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      });

      // Update ticket status based on who replied
      let newStatus: TicketStatus;
      if (isStaff) {
        newStatus = TicketStatus.WAITING_FOR_CUSTOMER;
      } else {
        // If the user replies, set to open or in progress
        newStatus = ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED
          ? TicketStatus.OPEN
          : TicketStatus.IN_PROGRESS;
      }

      await this.prisma.ticket.update({
        where: { id: data.ticketId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
          // If the ticket was closed and is reopened, clear the closedAt date
          ...(ticket.status === TicketStatus.CLOSED || ticket.status === TicketStatus.RESOLVED
            ? { closedAt: null }
            : {}),
        },
      });

      // Send notification
      if (isStaff) {
        // Notify the customer
        await this.notificationService.sendNotificationToUsers(
          [(ticket.user as any).id],
          {
            type: NotificationType.SYSTEM,
            title: 'New Reply to Your Ticket',
            message: `There is a new reply to your ticket "${ticket.subject}"`,
            link: `/tickets/${data.ticketId}`,
          }
        );
      } else {
        // Notify admins about customer reply
        const adminIds = await this.getAdminUserIds();
        if (adminIds.length > 0) {
          await this.notificationService.sendNotificationToUsers(adminIds, {
            type: NotificationType.SYSTEM,
            title: 'New Customer Reply',
            message: `There is a new customer reply to ticket "${ticket.subject}"`,
            link: `/admin/tickets/${data.ticketId}`,
          });
        }
      }

      return reply;
    } catch (error) {
      this.logger.error(`Error adding ticket reply: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get ticket statistics (admin only)
   */
  async getTicketStats() {
    try {
      // Get counts for each status
      const [open, inProgress, waitingForCustomer, waitingForThirdParty, resolved, closed, total] = await Promise.all([
        this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
        this.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        this.prisma.ticket.count({ where: { status: TicketStatus.WAITING_FOR_CUSTOMER } }),
        this.prisma.ticket.count({ where: { status: TicketStatus.WAITING_FOR_THIRD_PARTY } }),
        this.prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
        this.prisma.ticket.count({ where: { status: TicketStatus.CLOSED } }),
        this.prisma.ticket.count(),
      ]);

      // Calculate average first response time (minutes)
      const ticketsWithReplies = await this.prisma.ticket.findMany({
        where: {
          replies: {
            some: {
              isFromStaff: true,
            },
          },
        },
        select: {
          createdAt: true,
          replies: {
            where: {
              isFromStaff: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
            select: {
              createdAt: true,
            },
          },
        },
      });

      let totalResponseTimeMinutes = 0;
      let ticketsWithResponseTime = 0;

      ticketsWithReplies.forEach(ticket => {
        if (ticket.replies.length > 0) {
          const ticketCreatedAt = new Date(ticket.createdAt).getTime();
          const firstResponseAt = new Date(ticket.replies[0].createdAt).getTime();
          const responseTimeMinutes = (firstResponseAt - ticketCreatedAt) / (1000 * 60);
          totalResponseTimeMinutes += responseTimeMinutes;
          ticketsWithResponseTime++;
        }
      });

      const averageResponseTimeMinutes = ticketsWithResponseTime > 0
        ? Math.round(totalResponseTimeMinutes / ticketsWithResponseTime)
        : 0;

      // Calculate average resolution time (hours)
      const resolvedTickets = await this.prisma.ticket.findMany({
        where: {
          closedAt: { not: null },
        },
        select: {
          createdAt: true,
          closedAt: true,
        },
      });

      let totalResolutionTimeHours = 0;
      resolvedTickets.forEach(ticket => {
        if (ticket.closedAt) {
          const ticketCreatedAt = new Date(ticket.createdAt).getTime();
          const ticketClosedAt = new Date(ticket.closedAt).getTime();
          const resolutionTimeHours = (ticketClosedAt - ticketCreatedAt) / (1000 * 60 * 60);
          totalResolutionTimeHours += resolutionTimeHours;
        }
      });

      const averageResolutionTimeHours = resolvedTickets.length > 0
        ? Math.round(totalResolutionTimeHours / resolvedTickets.length)
        : 0;

      return {
        open,
        inProgress,
        waitingForCustomer,
        waitingForThirdParty,
        resolved,
        closed,
        total,
        averageResponseTimeMinutes,
        averageResolutionTimeHours,
      };
    } catch (error) {
      this.logger.error(`Error getting ticket stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new ticket department
   */
  async createTicketDepartment(data: CreateTicketDepartmentInput) {
    try {
      const department = await (this.prisma as any).ticketDepartment.create({
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        },
      });

      return department;
    } catch (error) {
      this.logger.error(`Error creating ticket department: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a ticket department
   */
  async updateTicketDepartment(data: UpdateTicketDepartmentInput) {
    try {
      const department = await (this.prisma as any).ticketDepartment.update({
        where: { id: data.id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return department;
    } catch (error) {
      this.logger.error(`Error updating ticket department: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a ticket department
   */
  async deleteTicketDepartment(id: string) {
    try {
      // Check if there are tickets using this department
      const ticketsUsingDepartment = await this.prisma.ticket.count({
        where: { department: id },
      });

      if (ticketsUsingDepartment > 0) {
        throw new Error('Cannot delete department as it is being used by tickets');
      }

      await (this.prisma as any).ticketDepartment.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting ticket department: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all ticket departments
   */
  async getAllTicketDepartments() {
    try {
      const departments = await (this.prisma as any).ticketDepartment.findMany({
        orderBy: { name: 'asc' },
      });

      return departments;
    } catch (error) {
      this.logger.error(`Error getting ticket departments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get active ticket departments
   */
  async getActiveTicketDepartments() {
    try {
      const departments = await (this.prisma as any).ticketDepartment.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      return departments;
    } catch (error) {
      this.logger.error(`Error getting active ticket departments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Helper: Get all admin user IDs
   */
  private async getAdminUserIds(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    return admins.map(admin => admin.id);
  }
}