import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag, GetTags } from './models/tag.model';
import { DeleteTagResponse } from './models/tag-response.model';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { SearchTagInput } from './dto/search-tag.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  /**
   * Create a new tag (Admin only)
   */
  @Mutation(() => Tag)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createTag(
    @Args('createTagInput') createTagInput: CreateTagInput,
  ) {
    return this.tagService.createTag(createTagInput);
  }

  /**
   * Get all tags with pagination and filtering
   */
  @Query(() => GetTags)
  async getTags(@Args('searchInput') searchInput: SearchTagInput) {
    return this.tagService.findAllTags(searchInput);
  }

  /**
   * Get a tag by ID
   */
  @Query(() => Tag)
  async getTagById(@Args('id') id: string) {
    return this.tagService.findTagById(id);
  }

  /**
   * Get a tag by slug
   */
  @Query(() => Tag)
  async getTagBySlug(@Args('slug') slug: string) {
    return this.tagService.findTagBySlug(slug);
  }

  /**
   * Update a tag (Admin only)
   */
  @Mutation(() => Tag)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateTag(
    @Args('updateTagInput') updateTagInput: UpdateTagInput,
  ) {
    return this.tagService.updateTag(updateTagInput);
  }

  /**
   * Delete a tag (Admin only)
   */
  @Mutation(() => DeleteTagResponse)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteTag(@Args('id') id: string) {
    return this.tagService.deleteTag(id);
  }
}