import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
}

// Register enums for GraphQL
registerEnumType(TimePeriod, {
  name: 'TimePeriod',
  description: 'Time period options for analytics'
});

registerEnumType(ChartType, {
  name: 'ChartType',
  description: 'Chart type options for analytics'
});

@InputType()
export class DateRangeInput {
  @Field(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => Date)
  @IsDate()
  endDate: Date;
}

@InputType()
export class AnalyticsQueryInput {
  @Field(() => TimePeriod)
  @IsEnum(TimePeriod)
  period: TimePeriod;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  productId?: string;

  @Field(() => Int, { defaultValue: 5 })
  @IsInt()
  @Min(1)
  limit: number = 5;

  @Field(() => ChartType, { defaultValue: ChartType.LINE })
  @IsEnum(ChartType)
  @IsOptional()
  chartType?: ChartType = ChartType.LINE;
}
