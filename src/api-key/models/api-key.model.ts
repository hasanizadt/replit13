import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum ApiKeyPermission {
  READ_PRODUCTS = 'READ_PRODUCTS',
  WRITE_PRODUCTS = 'WRITE_PRODUCTS',
  READ_ORDERS = 'READ_ORDERS',
  WRITE_ORDERS = 'WRITE_ORDERS',
  READ_CUSTOMERS = 'READ_CUSTOMERS',
  WRITE_CUSTOMERS = 'WRITE_CUSTOMERS',
  READ_ANALYTICS = 'READ_ANALYTICS',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  WEBHOOKS_MANAGEMENT = 'WEBHOOKS_MANAGEMENT',
}

registerEnumType(ApiKeyPermission, {
  name: 'ApiKeyPermission',
  description: 'Permissions available for API keys',
});

@ObjectType()
export class ApiKey {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { description: 'The API key (only shown once when created)' })
  key: string;

  @Field(() => [String])
  permissions: string[];

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field(() => Date, { nullable: true })
  lastUsedAt?: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ApiKeyPagination {
  @Field(() => [ApiKey])
  apiKeys: ApiKey[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  pageCount: number;
}

@ObjectType()
export class ApiKeyWithSecret {
  @Field(() => ApiKey)
  apiKey: ApiKey;

  @Field(() => String, { description: 'Secret key, only shown once' })
  secretKey: string;
}
