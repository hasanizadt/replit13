import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteTagResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}