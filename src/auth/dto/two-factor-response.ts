import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  qrCodeUrl?: string;

  @Field({ nullable: true })
  secret?: string;
}