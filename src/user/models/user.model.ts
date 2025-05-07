import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '../../auth/enums/role.enum';

// Using local SuccessInfo instead of importing OperationSuccess

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => String, { nullable: true })
  phone?: string;


  static fromPrisma(prismaUser: any): User {
    const user = new User();
    user.id = prismaUser.id;
    user.email = prismaUser.email;
    user.name = prismaUser.name; // Add missing name field
    user.firstName = prismaUser.firstName;
    user.lastName = prismaUser.lastName;
    user.phone = prismaUser.phone;
    user.avatarUrl = prismaUser.avatarUrl;
    user.role = prismaUser.role;
    user.isVerified = prismaUser.isVerified;
    user.isActive = prismaUser.isActive;
    user.createdAt = prismaUser.createdAt;
    user.updatedAt = prismaUser.updatedAt;
    //user.deletedAt = prismaUser.deletedAt; //removed as per edited code
    return user;
  }
}

@ObjectType('UserMeta')
export class Meta {
  @Field(() => Number, { nullable: true })
  itemCount?: number;

  @Field(() => Number, { nullable: true })
  totalItems?: number;

  @Field(() => Number, { nullable: true })
  itemsPerPage?: number;

  @Field(() => Number, { nullable: true })
  totalPages?: number;

  @Field(() => Number, { nullable: true })
  currentPage?: number;
}

@ObjectType()
export class GetUsers {
  @Field(() => [User], { nullable: true })
  results?: User[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}

// Using SuccessInfo from common/models instead of local definition
import { SuccessInfo } from '../../common/models/success.model';
export { SuccessInfo };