import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { CancelBy } from '../enums/cancel-by.enum';

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Field(() => CancelBy, { nullable: true })
  @IsOptional()
  @IsEnum(CancelBy)
  cancelBy?: CancelBy;
}