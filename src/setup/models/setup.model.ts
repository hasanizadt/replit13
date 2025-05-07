import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum SetupStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(SetupStepStatus, {
  name: 'SetupStepStatus',
  description: 'Status of setup step',
});

@ObjectType()
export class SetupStep {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => SetupStepStatus)
  status: SetupStepStatus;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Int)
  order: number;

  @Field(() => Boolean)
  isRequired: boolean;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;
}

@ObjectType()
export class SetupProgress {
  @Field(() => [SetupStep])
  steps: SetupStep[];

  @Field(() => Int)
  completedSteps: number;

  @Field(() => Int)
  totalSteps: number;

  @Field(() => Int)
  progressPercentage: number;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => Boolean)
  hasErrors: boolean;
}

@ObjectType()
export class SetupResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => SetupStep, { nullable: true })
  step?: SetupStep;
}

@ObjectType()
export class SystemStatus {
  @Field(() => Boolean)
  databaseConnected: boolean;

  @Field(() => Boolean)
  redisConnected: boolean;

  @Field(() => Boolean)
  filesystemAccessible: boolean;

  @Field(() => Boolean)
  adminAccountExists: boolean;

  @Field(() => Boolean)
  requiredTablesExist: boolean;

  @Field(() => Boolean)
  schemaUpToDate: boolean;

  @Field(() => String, { nullable: true })
  systemVersion?: string;

  @Field(() => Date)
  timestamp: Date;
}
