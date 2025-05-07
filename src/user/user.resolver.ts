import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SearchInput } from '../shared/dto/search.input';
import { GetUsers, User, SuccessInfo } from './models/user.model';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Get the current authenticated user's profile
   */
  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context) {
    const userId = context.req.user.id;
    return this.userService.findById(userId);
  }

  /**
   * Get all users with pagination and filtering (Admin only)
   */
  @Query(() => GetUsers)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUsers(@Args('searchInput') searchInput: SearchInput) {
    return this.userService.findAll(searchInput);
  }

  /**
   * Get a specific user by ID (Admin only)
   */
  @Query(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUserById(@Args('id') id: string) {
    return this.userService.findById(id);
  }

  /**
   * Create a new user (Admin only)
   */
  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  /**
   * Ban a user (Admin only)
   */
  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async banUser(@Args('id') id: string) {
    return this.userService.banUser(id);
  }

  /**
   * Unban a user (Admin only)
   */
  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async unbanUser(@Args('id') id: string) {
    return this.userService.unbanUser(id);
  }

  /**
   * Delete a user (Admin only)
   */
  @Mutation(() => SuccessInfo) // Using SuccessInfo instead of OperationSuccess
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteUser(@Args('id') id: string) {
    return this.userService.deleteUser(id);
  }
}