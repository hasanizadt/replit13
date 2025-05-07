import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemoveWishlistResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class WishlistCheckResponse {
  @Field(() => Boolean)
  inWishlist: boolean;

  @Field(() => String, { nullable: true })
  wishlistId: string | null;
}