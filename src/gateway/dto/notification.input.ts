import { InputType, Field } from '@nestjs/graphql';
import { 
  IsBoolean, 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  Min 
} from 'class-validator';
import { NotificationType } from '../models/notification.model';

@InputType()
export class SearchNotificationsInput {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;

  @Field(() => NotificationType, { nullable: true })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @Field(() => Number, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Number, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  limit: number = 20;
}

@InputType()
export class MarkNotificationAsReadInput {
  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class MarkAllNotificationsAsReadInput {
  @Field(() => NotificationType, { nullable: true })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}

@InputType()
export class DeleteNotificationInput {
  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class DeleteAllNotificationsInput {
  @Field(() => NotificationType, { nullable: true })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}

@InputType()
export class CreateNotificationInput {
  @Field(() => [String])
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  link?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  metadata?: string;
}
