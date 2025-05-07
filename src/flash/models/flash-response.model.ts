import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteFlashResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}