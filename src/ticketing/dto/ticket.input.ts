import { InputType, Field, Int } from '@nestjs/graphql';
import { 
  IsArray,
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TicketStatus, TicketPriority } from '../models/ticket.model';

@InputType()
export class CreateTicketInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  subject: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;

  @Field(() => TicketPriority, { defaultValue: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  department?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

@InputType()
export class CreateTicketReplyInput {
  @Field(() => String)
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  message: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

@InputType()
export class UpdateTicketInput {
  @Field(() => String)
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => TicketStatus, { nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @Field(() => TicketPriority, { nullable: true })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  department?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}

@InputType()
export class SearchTicketInput {
  @Field(() => TicketStatus, { nullable: true })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @Field(() => TicketPriority, { nullable: true })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  department?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit: number = 20;
}

@InputType()
export class CreateTicketDepartmentInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  isActive?: boolean;
}

@InputType()
export class UpdateTicketDepartmentInput {
  @Field(() => String)
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
