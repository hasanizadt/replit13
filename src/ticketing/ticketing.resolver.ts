import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { TicketingService } from './ticketing.service';
import {
  Ticket,
  TicketReply,
  TicketDepartment,
  TicketPagination,
  TicketStats,
} from './models/ticket.model';
import {
  CreateTicketInput,
  CreateTicketReplyInput,
  UpdateTicketInput,
  SearchTicketInput,
  CreateTicketDepartmentInput,
  UpdateTicketDepartmentInput,
} from './dto/ticket.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Ticket)
export class TicketingResolver {
  constructor(private readonly ticketingService: TicketingService) {}

  /**
   * Create a new support ticket (User only)
   */
  @Mutation(() => Ticket)
  @UseGuards(AuthGuard)
  async createTicket(
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.ticketingService.createTicket(userId, createTicketInput);
  }

  /**
   * Get a ticket by ID (User or Admin)
   */
  @Query(() => Ticket)
  @UseGuards(AuthGuard)
  async getTicketById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    const isAdmin = context.req.user.role === 'ADMIN';
    return this.ticketingService.getTicketById(id, userId, isAdmin);
  }

  /**
   * Get all tickets with pagination and filtering (Admin only)
   */
  @Query(() => TicketPagination)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllTickets(
    @Args('searchInput') searchInput: SearchTicketInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.ticketingService.searchTickets(searchInput, userId, true);
  }

  /**
   * Get user's tickets with pagination and filtering (User only)
   */
  @Query(() => TicketPagination)
  @UseGuards(AuthGuard)
  async getMyTickets(
    @Args('searchInput') searchInput: SearchTicketInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.ticketingService.getUserTickets(userId, searchInput);
  }

  /**
   * Update a ticket (Admin only)
   */
  @Mutation(() => Ticket)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateTicket(
    @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
    @Context() context,
  ) {
    const adminId = context.req.user.id;
    return this.ticketingService.updateTicket(updateTicketInput.id, updateTicketInput, adminId);
  }

  /**
   * Delete a ticket (User or Admin)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteTicket(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    const isAdmin = context.req.user.role === 'ADMIN';
    return this.ticketingService.deleteTicket(id, userId, isAdmin);
  }

  /**
   * Add a reply to a ticket (User or Admin)
   */
  @Mutation(() => TicketReply)
  @UseGuards(AuthGuard)
  async addTicketReply(
    @Args('createTicketReplyInput') createTicketReplyInput: CreateTicketReplyInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    const isStaff = context.req.user.role === 'ADMIN';
    return this.ticketingService.addTicketReply(userId, createTicketReplyInput, isStaff);
  }

  /**
   * Get ticket statistics (Admin only)
   */
  @Query(() => TicketStats)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getTicketStats() {
    return this.ticketingService.getTicketStats();
  }

  /**
   * Create a ticket department (Admin only)
   */
  @Mutation(() => TicketDepartment)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createTicketDepartment(
    @Args('createTicketDepartmentInput') createTicketDepartmentInput: CreateTicketDepartmentInput,
  ) {
    return this.ticketingService.createTicketDepartment(createTicketDepartmentInput);
  }

  /**
   * Update a ticket department (Admin only)
   */
  @Mutation(() => TicketDepartment)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateTicketDepartment(
    @Args('updateTicketDepartmentInput') updateTicketDepartmentInput: UpdateTicketDepartmentInput,
  ) {
    return this.ticketingService.updateTicketDepartment(updateTicketDepartmentInput);
  }

  /**
   * Delete a ticket department (Admin only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteTicketDepartment(
    @Args('id') id: string,
  ) {
    return this.ticketingService.deleteTicketDepartment(id);
  }

  /**
   * Get all ticket departments (Admin only)
   */
  @Query(() => [TicketDepartment])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllTicketDepartments() {
    return this.ticketingService.getAllTicketDepartments();
  }

  /**
   * Get active ticket departments (Public)
   */
  @Query(() => [TicketDepartment])
  async getActiveTicketDepartments() {
    return this.ticketingService.getActiveTicketDepartments();
  }
}
