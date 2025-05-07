import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateAttributeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
