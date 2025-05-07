import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SellerService } from './seller.service';
import { Seller, GetSellersList } from './models/seller.model';
import { Bank } from './models/bank.model';
// Using GetSellers from seller.model.ts instead of get-sellers.model.ts
import { CreateSellerInput } from './dto/create-seller.input';
import { UpdateSellerInput } from './dto/update-seller.input';
import { CreateBankInput } from './dto/create-bank.input';
import { UpdateBankInput } from './dto/update-bank.input';
import { SearchSellerInput } from './dto/search-seller.input';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => Seller)
export class SellerResolver {
  constructor(
    private readonly sellerService: SellerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new seller account (User only)
   */
  @Mutation(() => Seller)
  @UseGuards(AuthGuard)
  async createSeller(
    @Args('createSellerInput') createSellerInput: CreateSellerInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.sellerService.createSeller(userId, createSellerInput);
  }

  /**
   * Get all sellers with pagination and filtering (Admin only)
   */
  @Query(() => GetSellersList)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSellers(@Args('searchInput') searchInput: SearchSellerInput) {
    return this.sellerService.findAllSellers(searchInput);
  }

  /**
   * Get my seller account (User and Seller)
   */
  @Query(() => Seller)
  @UseGuards(AuthGuard)
  async getMySellerAccount(@Context() context) {
    const userId = context.req.user.id;
    return this.sellerService.findSellerByUserId(userId);
  }

  /**
   * Get a seller by ID (Admin, User - own seller account)
   */
  @Query(() => Seller)
  @UseGuards(AuthGuard)
  async getSellerById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const seller = await this.sellerService.findSellerById(id);

    // Check if the user has permission to view this seller
    if (user.role === 'ADMIN' || seller.userId === user.id) {
      return seller;
    }

    throw new Error('You do not have permission to view this seller');
  }

  /**
   * Update a seller (Admin and Seller - own account)
   */
  @Mutation(() => Seller)
  @UseGuards(AuthGuard)
  async updateSeller(
    @Args('updateSellerInput') updateSellerInput: UpdateSellerInput,
    @Context() context,
  ) {
    const { user } = context.req;
    const seller = await this.sellerService.findSellerById(updateSellerInput.id);

    // Restrict verification and banning status update to admin only
    if ((updateSellerInput.isVerified !== undefined || updateSellerInput.isBanned !== undefined) && user.role !== 'ADMIN') {
      throw new Error('Only admin can update verification and banning status');
    }

    // Check if the user has permission to update this seller
    if (user.role === 'ADMIN' || seller.userId === user.id) {
      return this.sellerService.updateSeller(updateSellerInput);
    }

    throw new Error('You do not have permission to update this seller');
  }

  /**
   * Delete a seller (Admin only)
   */
  @Mutation(() => Seller)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteSeller(@Args('id') id: string) {
    return this.sellerService.deleteSeller(id);
  }

  /**
   * Create a bank account for a seller (Seller only)
   */
  @Mutation(() => Bank)
  @UseGuards(AuthGuard)
  async createBank(
    @Args('createBankInput') createBankInput: CreateBankInput,
    @Context() context,
  ) {
    const { user } = context.req;
    const seller = await this.sellerService.findSellerByUserId(user.id);
    return this.sellerService.createBank(seller.id, createBankInput);
  }

  /**
   * Update a bank account (Admin and Seller - own account)
   */
  @Mutation(() => Bank)
  @UseGuards(AuthGuard)
  async updateBank(
    @Args('updateBankInput') updateBankInput: UpdateBankInput,
    @Context() context,
  ) {
    const { user } = context.req;
    
    try {
      const bank = await this.sellerService.findBankById(updateBankInput.id);
      
      // Check if the user has permission to update this bank
      if (user.role === 'ADMIN' || (bank.seller as any).userId === user.id) {
        return this.sellerService.updateBank(updateBankInput);
      }
      
      throw new Error('You do not have permission to update this bank account');
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new Error(`Bank with ID ${updateBankInput.id} not found`);
      }
      throw error;
    }
  }

  /**
   * Get bank account by seller ID (Admin and Seller - own account)
   */
  @Query(() => Bank)
  @UseGuards(AuthGuard)
  async getBankBySellerId(@Args('sellerId') sellerId: string, @Context() context) {
    const { user } = context.req;
    const seller = await this.sellerService.findSellerById(sellerId);

    // Check if the user has permission to view this bank
    if (user.role === 'ADMIN' || seller.userId === user.id) {
      return this.sellerService.findBankBySellerId(sellerId);
    }

    throw new Error('You do not have permission to view this bank account');
  }

  /**
   * Get my bank account (Seller only)
   */
  @Query(() => Bank)
  @UseGuards(AuthGuard)
  async getMyBank(@Context() context) {
    const { user } = context.req;
    const seller = await this.sellerService.findSellerByUserId(user.id);
    return this.sellerService.findBankBySellerId(seller.id);
  }

  /**
   * Delete a bank account (Admin only)
   */
  @Mutation(() => Bank)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBank(@Args('id') id: string) {
    return this.sellerService.deleteBank(id);
  }
}