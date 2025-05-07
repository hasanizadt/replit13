import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';
import { LoginInput } from './dto/login.input';
import { SignupInput } from '../user/dto/signup.dto';
import { Public } from './decorator/auth.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login mutation that allows a user to authenticate with phone and password
   */
  @Public()
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * Signup mutation that allows a new user to register
   */
  @Public()
  @Mutation(() => AuthResponse)
  async signup(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signup(signupInput);
  }
}