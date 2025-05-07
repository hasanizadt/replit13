import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingZone, GetShippingZones } from './models/shipping-zone.model';
import { ShippingMethod, GetShippingMethods } from './models/shipping-method.model';
import { CreateShippingZoneInput } from './dto/create-shipping-zone.input';
import { UpdateShippingZoneInput } from './dto/update-shipping-zone.input';
import { SearchShippingZoneInput } from './dto/search-shipping-zone.input';
import { CreateShippingMethodInput } from './dto/create-shipping-method.input';
import { UpdateShippingMethodInput } from './dto/update-shipping-method.input';
import { SearchShippingMethodInput } from './dto/search-shipping-method.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => ShippingZone)
export class ShippingResolver {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * Create a new shipping zone (Admin only)
   */
  @Mutation(() => ShippingZone)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createShippingZone(
    @Args('createShippingZoneInput') createShippingZoneInput: CreateShippingZoneInput,
  ) {
    return this.shippingService.createShippingZone(createShippingZoneInput);
  }

  /**
   * Get all shipping zones with pagination and filtering
   */
  @Query(() => GetShippingZones)
  async getShippingZones(@Args('searchInput') searchInput: SearchShippingZoneInput) {
    return this.shippingService.findAllShippingZones(searchInput);
  }

  /**
   * Get a shipping zone by ID
   */
  @Query(() => ShippingZone)
  async getShippingZoneById(@Args('id') id: string) {
    return this.shippingService.findShippingZoneById(id);
  }

  /**
   * Update a shipping zone (Admin only)
   */
  @Mutation(() => ShippingZone)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateShippingZone(
    @Args('updateShippingZoneInput') updateShippingZoneInput: UpdateShippingZoneInput,
  ) {
    return this.shippingService.updateShippingZone(updateShippingZoneInput);
  }

  /**
   * Delete a shipping zone (Admin only)
   */
  @Mutation(() => ShippingZone)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteShippingZone(@Args('id') id: string) {
    return this.shippingService.deleteShippingZone(id);
  }

  /**
   * Create a new shipping method (Admin only)
   */
  @Mutation(() => ShippingMethod)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createShippingMethod(
    @Args('createShippingMethodInput') createShippingMethodInput: CreateShippingMethodInput,
  ) {
    return this.shippingService.createShippingMethod(createShippingMethodInput);
  }

  /**
   * Get all shipping methods with pagination and filtering
   */
  @Query(() => GetShippingMethods)
  async getShippingMethods(@Args('searchInput') searchInput: SearchShippingMethodInput) {
    return this.shippingService.findAllShippingMethods(searchInput);
  }

  /**
   * Get a shipping method by ID
   */
  @Query(() => ShippingMethod)
  async getShippingMethodById(@Args('id') id: string) {
    return this.shippingService.findShippingMethodById(id);
  }

  /**
   * Update a shipping method (Admin only)
   */
  @Mutation(() => ShippingMethod)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateShippingMethod(
    @Args('updateShippingMethodInput') updateShippingMethodInput: UpdateShippingMethodInput,
  ) {
    return this.shippingService.updateShippingMethod(updateShippingMethodInput);
  }

  /**
   * Delete a shipping method (Admin only)
   */
  @Mutation(() => ShippingMethod)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteShippingMethod(@Args('id') id: string) {
    return this.shippingService.deleteShippingMethod(id);
  }

  /**
   * Get applicable shipping methods for a location
   */
  @Query(() => [ShippingMethod])
  async getShippingMethodsForLocation(
    @Args('country') country: string,
    @Args('state', { nullable: true }) state?: string,
    @Args('city', { nullable: true }) city?: string,
    @Args('zipCode', { nullable: true }) zipCode?: string,
    @Args('orderAmount', { nullable: true }) orderAmount?: number,
  ) {
    return this.shippingService.getShippingMethodsForLocation(
      country,
      state,
      city,
      zipCode,
      orderAmount,
    );
  }
}
