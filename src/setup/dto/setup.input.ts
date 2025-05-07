import { InputType, Field } from '@nestjs/graphql';
import { 
  IsBoolean, 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString,
  MinLength,
  MaxLength
} from 'class-validator';

@InputType()
export class InitSystemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  appName: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  appUrl: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  loadDemoData?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  setupDefaultSettings?: boolean;
}

@InputType()
export class CreateAdminUserInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  firstName: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  lastName: string;

  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

@InputType()
export class RunSetupStepInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  stepId: string;
}

@InputType()
export class CompleteSetupInput {
  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  activateSystem?: boolean;
}
