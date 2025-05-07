import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}