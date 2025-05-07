import { InputType, Field, Int } from '@nestjs/graphql';
import { 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  Max, 
  Min, 
  ValidateIf 
} from 'class-validator';
import { FeedbackType, FeedbackStatus } from '../models/feedback.model';

@InputType()
export class CreateFeedbackInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  comment?: string;

  @Field(() => FeedbackType)
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ValidateIf(o => o.type === FeedbackType.PRODUCT)
  @IsNotEmpty({ message: 'ProductId is required for product feedback' })
  productIdValidator() {
    return this.productId !== undefined;
  }

  @ValidateIf(o => o.type === FeedbackType.ORDER)
  @IsNotEmpty({ message: 'OrderId is required for order feedback' })
  orderIdValidator() {
    return this.orderId !== undefined;
  }

  @ValidateIf(o => o.type === FeedbackType.SELLER)
  @IsNotEmpty({ message: 'SellerId is required for seller feedback' })
  sellerIdValidator() {
    return this.sellerId !== undefined;
  }
}

@InputType()
export class UpdateFeedbackInput {
  @Field(() => String)
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  comment?: string;
}

@InputType()
export class UpdateFeedbackStatusInput {
  @Field(() => String)
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => FeedbackStatus)
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

@InputType()
export class SearchFeedbackInput {
  @Field(() => FeedbackType, { nullable: true })
  @IsEnum(FeedbackType)
  @IsOptional()
  type?: FeedbackType;

  @Field(() => FeedbackStatus, { nullable: true })
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  limit: number = 20;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
