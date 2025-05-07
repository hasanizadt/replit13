
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => Boolean)
  read: boolean;

  @Field(() => String, { nullable: true })
  link: string | null;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class NotificationPagination {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field()
  totalCount: number;

  @Field()
  unreadCount: number;
}
