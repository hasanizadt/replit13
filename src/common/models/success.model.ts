
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SuccessInfo {
  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => String)
  message: string;
  
  @Field(() => String, { nullable: true })
  data?: any;
}

// OperationSuccess was removed and unified with SuccessInfo
// Other files now use SuccessInfo instead
