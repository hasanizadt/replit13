import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { SetupService } from './setup.service';
import { SetupProgress, SetupResult, SystemStatus, SetupStep } from './models/setup.model';
import { InitSystemInput, CreateAdminUserInput, RunSetupStepInput, CompleteSetupInput } from './dto/setup.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver()
export class SetupResolver {
  constructor(private readonly setupService: SetupService) {}

  /**
   * Get setup progress
   */
  @Query(() => SetupProgress)
  async getSetupProgress() {
    return this.setupService.getSetupProgress();
  }

  /**
   * Get system status
   */
  @Query(() => SystemStatus)
  async getSystemStatus() {
    return this.setupService.getSystemStatus();
  }

  /**
   * Run a specific setup step
   */
  @Mutation(() => SetupResult)
  async runSetupStep(
    @Args('input') input: RunSetupStepInput,
  ) {
    return this.setupService.runSetupStep(input);
  }
}
