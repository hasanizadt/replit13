import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => Number, { defaultValue: 0 })
  order: number;

  @Field(() => String, { nullable: true })
  seoTitle?: string;

  @Field(() => String, { nullable: true })
  seoDescription?: string;

  @Field(() => String, { nullable: true })
  seoKeywords?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Category, { nullable: true })
  parent?: Category;

  @Field(() => [Category], { nullable: true })
  subcategories?: Category[];
}

/**
 * Represents a "main category" (top level with no parent)
 */
@ObjectType()
export class MainCategory extends Category {
  // Main categories don't have a parent
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}

/**
 * Represents a "sub-category" (third level category with both parent and grandparent)
 */
@ObjectType()
export class SubCategory extends Category {
  // The sub-category will always have a parent
  @Field(() => Category)
  parent: Category;

  // The parent will also have a parent (i.e. the "grandparent" or "main category")
  @Field(() => Category, { nullable: true })
  grandparent?: Category;
}

@ObjectType('CategoryMeta')
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
export class GetCategories {
  @Field(() => [Category], { nullable: true })
  results?: Category[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}

@ObjectType()
export class GetMainCategories {
  @Field(() => [MainCategory], { nullable: true })
  results?: MainCategory[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}

@ObjectType()
export class GetSubCategories {
  @Field(() => [SubCategory], { nullable: true })
  results?: SubCategory[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}
