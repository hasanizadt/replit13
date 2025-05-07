import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateNotificationInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => Boolean)
  @IsBoolean()
  read: boolean; // Changed from isRead to read to match Prisma schema
}
