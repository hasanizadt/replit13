import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM'
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
export class Notification {
  @Field(() => String)
  id: string;

  @Field(() => String)
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => Boolean)
  read: boolean;

  @Field(() => String)
  userId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class NotificationPagination {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  unreadCount: number;

  @Field(() => Number)
  pageCount: number;
}