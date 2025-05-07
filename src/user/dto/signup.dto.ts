import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty({ message: 'نام الزامی است' })
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  @IsEmail({}, { message: 'ایمیل نامعتبر است' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'شماره تلفن الزامی است' })
  @Matches(/^(09|\+989|989)\d{9}$/, { message: 'فرمت شماره تلفن نامعتبر است' })
  phone: string;

  @Field()
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
  password: string;
}