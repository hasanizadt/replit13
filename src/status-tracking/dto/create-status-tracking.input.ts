import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateStatusTrackingInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fromStatus: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  toStatus: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  paymentId?: string;
}
