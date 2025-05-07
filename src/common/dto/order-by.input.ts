import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(OrderDirection, {
  name: 'OrderDirection',
  description: 'Sorting direction',
});

@InputType()
export class OrderByInput {
  @Field(() => String)
  field: string;

  @Field(() => OrderDirection, { defaultValue: OrderDirection.ASC })
  @IsEnum(OrderDirection)
  direction: OrderDirection = OrderDirection.ASC;
}