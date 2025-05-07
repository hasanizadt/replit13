import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteBrandResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}