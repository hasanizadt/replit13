import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateAttributeValueInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  value?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  attributeId?: string;
}
