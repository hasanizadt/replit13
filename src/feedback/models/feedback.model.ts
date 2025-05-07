import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum FeedbackType {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  SELLER = 'SELLER',
  GENERAL = 'GENERAL',
}

registerEnumType(FeedbackType, {
  name: 'FeedbackType',
  description: 'The type of feedback',
});

export enum FeedbackStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(FeedbackStatus, {
  name: 'FeedbackStatus',
  description: 'The status of feedback',
});

@ObjectType()
export class Feedback {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => String, { nullable: true })
  sellerId?: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => FeedbackType)
  type: FeedbackType;

  @Field(() => FeedbackStatus)
  status: FeedbackStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class FeedbackPagination {
  @Field(() => [Feedback])
  feedbacks: Feedback[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageCount: number;

  @Field(() => Float, { nullable: true })
  averageRating?: number;
}

@ObjectType()
export class FeedbackSummary {
  @Field(() => Int)
  totalFeedbacks: number;

  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  oneStar: number;

  @Field(() => Int)
  twoStars: number;

  @Field(() => Int)
  threeStars: number;

  @Field(() => Int)
  fourStars: number;

  @Field(() => Int)
  fiveStars: number;
}
