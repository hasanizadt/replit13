import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from '../user/dto/signup.dto';
import { AuthResponse } from './dto/auth-response';
import * as bcrypt from 'bcrypt';
import { User } from '../user/models/user.model';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Sign up a new user
   */
  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    // Check if a user with the provided phone already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { phone: signupInput.phone },
    });

    if (existingUser) {
      throw new ConflictException('کاربری با این شماره تلفن قبلاً ثبت شده است');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(signupInput.password, 10);

    // Create the new user with a manually generated UUID and timestamps
    const now = new Date();
    const newUser = await this.prisma.user.create({
      data: {
        id: this.generateUUID(), // Generate a UUID manually
        name: signupInput.name,
        email: signupInput.email,
        phone: signupInput.phone,
        password: hashedPassword,
        role: Role.USER, // Default role is USER
        isVerified: false, // User is not verified by default
        createdAt: now, // Set creation time
        updatedAt: now, // Set update time
        status: "ACTIVE", // Set default status
      },
    });

    // Generate a JWT token
    const token = this.generateToken(newUser);

    // Return the auth response
    return {
      token,
      user: User.fromPrisma(newUser),
    };
  }

  /**
   * Login an existing user
   */
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    // Find the user directly from the database
    let dbUser;
    try {
      // Get the raw user data from database for password verification
      dbUser = await this.prisma.user.findFirst({
        where: { phone: loginInput.phone },
      });
      
      if (!dbUser) {
        throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (error) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    // Check if the user is banned (assuming isActive field is used for banning)
    if (dbUser.isActive === false) {
      throw new UnauthorizedException('حساب شما مسدود شده است');
    }

    // Verify the password with the raw password from database
    const isPasswordValid = await bcrypt.compare(
      loginInput.password,
      dbUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    // Generate a JWT token
    const token = this.generateToken(dbUser);

    // Convert to User model for response
    const user = User.fromPrisma(dbUser);

    // Return the auth response
    return {
      token,
      user,
    };
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
  
  /**
   * Generate a UUID
   */
  private generateUUID(): string {
    return uuidv4();
  }
}