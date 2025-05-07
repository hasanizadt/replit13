import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAttributeValueInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  value: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  attributeId: string;
}
