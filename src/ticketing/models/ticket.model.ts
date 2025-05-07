import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  WAITING_FOR_THIRD_PARTY = 'WAITING_FOR_THIRD_PARTY',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

registerEnumType(TicketStatus, {
  name: 'TicketStatus',
  description: 'Status of a support ticket',
});

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

registerEnumType(TicketPriority, {
  name: 'TicketPriority',
  description: 'Priority of a support ticket',
});

@ObjectType()
export class TicketDepartment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TicketAttachment {
  @Field(() => String)
  url: string;

  @Field(() => String)
  filename: string;

  @Field(() => String)
  mimeType: string;

  @Field(() => Number)
  size: number;
}

@ObjectType()
export class TicketReply {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  ticketId: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  message: string;

  @Field(() => Boolean)
  isFromStaff: boolean;

  @Field(() => [String])
  attachments: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class Ticket {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  message: string;

  @Field(() => TicketStatus)
  status: TicketStatus;

  @Field(() => TicketPriority)
  priority: TicketPriority;

  @Field(() => String, { nullable: true })
  department?: string;

  @Field(() => String, { nullable: true })
  assignedToId?: string;

  @Field(() => String, { nullable: true })
  reference?: string;

  @Field(() => [String])
  attachments: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  closedAt?: Date;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => User, { nullable: true })
  assignedTo?: User;

  @Field(() => [TicketReply], { nullable: true })
  replies?: TicketReply[];
}

@ObjectType()
export class TicketPagination {
  @Field(() => [Ticket])
  tickets: Ticket[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  pageCount: number;
}

@ObjectType()
export class TicketStats {
  @Field(() => Number)
  open: number;

  @Field(() => Number)
  inProgress: number;

  @Field(() => Number)
  waitingForCustomer: number;

  @Field(() => Number)
  waitingForThirdParty: number;

  @Field(() => Number)
  resolved: number;

  @Field(() => Number)
  closed: number;

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  averageResponseTimeMinutes: number;

  @Field(() => Number)
  averageResolutionTimeHours: number;
}
