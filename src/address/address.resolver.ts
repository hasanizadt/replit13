import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { Address, GetAddresses } from './models/address.model';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { SearchAddressInput } from './dto/search-address.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Create a new address (User only)
   */
  @Mutation(() => Address)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
    @Context() context,
  ) {
    const { user } = context;
    return this.addressService.createAddress(user.id, createAddressInput);
  }

  /**
   * Get all addresses for the current user (User only)
   */
  @Query(() => GetAddresses)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async getMyAddresses(
    @Args('searchInput') searchInput: SearchAddressInput,
    @Context() context,
  ) {
    const { user } = context;
    return this.addressService.findAllAddresses(user.id, searchInput);
  }

  /**
   * Get an address by ID (User only)
   */
  @Query(() => Address)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async getAddressById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const { user } = context;
    return this.addressService.findAddressById(user.id, id);
  }

  /**
   * Get the default address for the current user (User only)
   */
  @Query(() => Address)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async getDefaultAddress(@Context() context) {
    const { user } = context;
    return this.addressService.findDefaultAddress(user.id);
  }

  /**
   * Update an address (User only)
   */
  @Mutation(() => Address)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async updateAddress(
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
    @Context() context,
  ) {
    const { user } = context;
    return this.addressService.updateAddress(user.id, updateAddressInput);
  }

  /**
   * Delete an address (User only)
   */
  @Mutation(() => Address)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async deleteAddress(
    @Args('id') id: string,
    @Context() context,
  ) {
    const { user } = context;
    return this.addressService.deleteAddress(user.id, id);
  }
}
