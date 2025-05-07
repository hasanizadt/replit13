import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty({ message: 'نام الزامی است' })
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'ایمیل نامعتبر است' })
  email?: string;

  @Field()
  @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
  @Matches(/^(09|\+989|989)\d{9}$/, { message: 'فرمت شماره تلفن نامعتبر است' })
  phone: string;

  @Field()
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  isVerified?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  role?: string;
}