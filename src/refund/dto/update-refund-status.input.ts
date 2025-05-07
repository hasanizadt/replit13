import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { RefundStatus } from '../enums/refund-status.enum';

@InputType()
export class UpdateRefundStatusInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => RefundStatus)
  @IsEnum(RefundStatus)
  status: RefundStatus;
}