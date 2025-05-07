import { Injectable, NotFoundException } from '@nestjs/common';
import { User, SuccessInfo } from './models/user.model';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { SearchInput } from '../shared/dto/search.input';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by their ID
   */
  async findOneById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return User.fromPrisma(user);
  }

  /**
   * Find a user by their phone number
   */
  async findOneByPhone(phone: string): Promise<User> {
    // Since we know we're using the 'phone' field in our schema, simplify the query
    const user = await this.prisma.user.findFirst({
      where: { 
        phone: phone
      },
    });

    if (!user) {
      throw new NotFoundException(`User with phone ${phone} not found`);
    }

    return User.fromPrisma(user);
  }

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return User.fromPrisma(user);
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll(searchInput: SearchInput) {
    const { search, limit, page } = searchInput;

    // Build the filter
    const where: any = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as any } },
            { lastName: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ] as any,
        }
      : {};

    // Get the total count
    const totalItems = await this.prisma.user.count({ where });

    // Calculate pagination
    const skip = page ? (page - 1) * limit : 0;
    const take = limit || 10;

    // Get the users
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to DTO
    const results = users.map((user) => User.fromPrisma(user));

    // Calculate metadata
    const totalPages = Math.ceil(totalItems / take);

    return {
      results,
      meta: {
        itemCount: results.length,
        totalItems,
        itemsPerPage: take,
        totalPages,
        currentPage: page || 1,
      },
    };
  }

  /**
   * Create a new user
   */
  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

    // Split the name into first and last name
    const firstName = createUserInput.name.split(' ')[0] || '';
    const lastName = createUserInput.name.split(' ').slice(1).join(' ') || '';
    
    const user = await this.prisma.user.create({
      data: {
        name: createUserInput.name, // Add the required name field 
        email: createUserInput.email,
        firstName: firstName,
        lastName: lastName,
        phone: createUserInput.phone,
        password: hashedPassword,
        isVerified: true, // Since admin creates, let's assume it's verified
        role: (createUserInput.role || Role.USER) as Role,
      },
    });

    return User.fromPrisma(user);
  }

  /**
   * Ban a user
   */
  async banUser(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return User.fromPrisma(user);
  }

  /**
   * Unban a user
   */
  async unbanUser(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return User.fromPrisma(user);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<SuccessInfo> {
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: `User with ID ${id} has been deleted successfully`,
    };
  }
}