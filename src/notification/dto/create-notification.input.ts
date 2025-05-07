import { InputType, Field } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  link?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  image?: string;

  @Field(() => String)
  @IsUUID()
  userId: string;
}
