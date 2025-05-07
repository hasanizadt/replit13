import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { Attribute, GetAttributes } from './models/attribute.model';
import { AttributeValue, GetAttributeValues } from './models/attribute-value.model';
import { CreateAttributeInput } from './dto/create-attribute.input';
import { UpdateAttributeInput } from './dto/update-attribute.input';
import { SearchAttributeInput } from './dto/search-attribute.input';
import { CreateAttributeValueInput } from './dto/create-attribute-value.input';
import { UpdateAttributeValueInput } from './dto/update-attribute-value.input';
import { SearchAttributeValueInput } from './dto/search-attribute-value.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Attribute)
export class AttributesResolver {
  constructor(private readonly attributesService: AttributesService) {}

  /**
   * Create a new attribute (Admin only)
   */
  @Mutation(() => Attribute)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createAttribute(
    @Args('createAttributeInput') createAttributeInput: CreateAttributeInput,
  ) {
    return this.attributesService.createAttribute(createAttributeInput);
  }

  /**
   * Get all attributes with pagination and filtering
   */
  @Query(() => GetAttributes)
  async getAttributes(@Args('searchInput') searchInput: SearchAttributeInput) {
    return this.attributesService.findAllAttributes(searchInput);
  }

  /**
   * Get an attribute by ID
   */
  @Query(() => Attribute)
  async getAttributeById(@Args('id') id: string) {
    return this.attributesService.findAttributeById(id);
  }

  /**
   * Update an attribute (Admin only)
   */
  @Mutation(() => Attribute)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateAttribute(
    @Args('updateAttributeInput') updateAttributeInput: UpdateAttributeInput,
  ) {
    return this.attributesService.updateAttribute(updateAttributeInput);
  }

  /**
   * Delete an attribute (Admin only)
   */
  @Mutation(() => Attribute)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteAttribute(@Args('id') id: string) {
    return this.attributesService.deleteAttribute(id);
  }

  /**
   * Create a new attribute value (Admin only)
   */
  @Mutation(() => AttributeValue)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createAttributeValue(
    @Args('createAttributeValueInput') createAttributeValueInput: CreateAttributeValueInput,
  ) {
    return this.attributesService.createAttributeValue(createAttributeValueInput);
  }

  /**
   * Get all attribute values with pagination and filtering
   */
  @Query(() => GetAttributeValues)
  async getAttributeValues(@Args('searchInput') searchInput: SearchAttributeValueInput) {
    return this.attributesService.findAllAttributeValues(searchInput);
  }

  /**
   * Get an attribute value by ID
   */
  @Query(() => AttributeValue)
  async getAttributeValueById(@Args('id') id: string) {
    return this.attributesService.findAttributeValueById(id);
  }

  /**
   * Update an attribute value (Admin only)
   */
  @Mutation(() => AttributeValue)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateAttributeValue(
    @Args('updateAttributeValueInput') updateAttributeValueInput: UpdateAttributeValueInput,
  ) {
    return this.attributesService.updateAttributeValue(updateAttributeValueInput);
  }

  /**
   * Delete an attribute value (Admin only)
   */
  @Mutation(() => AttributeValue)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteAttributeValue(@Args('id') id: string) {
    return this.attributesService.deleteAttributeValue(id);
  }
}
