import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateAttributeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
