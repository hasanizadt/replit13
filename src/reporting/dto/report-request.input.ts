import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString,
  ValidateIf
} from 'class-validator';
import { 
  ReportType, 
  ReportFormat,
  TimePeriod
} from '../models/report.model';

@InputType()
export class GenerateReportInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => ReportType)
  @IsEnum(ReportType)
  type: ReportType;

  @Field(() => ReportFormat, { defaultValue: ReportFormat.JSON })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TimePeriod, { defaultValue: TimePeriod.MONTHLY })
  @IsEnum(TimePeriod)
  timePeriod: TimePeriod;

  @Field(() => Date, { nullable: true })
  @ValidateIf(o => o.timePeriod === TimePeriod.CUSTOM)
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @ValidateIf(o => o.timePeriod === TimePeriod.CUSTOM)
  @IsDate()
  endDate?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  filter?: string;
}

@InputType()
export class ReportListInput {
  @Field(() => ReportType, { nullable: true })
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
