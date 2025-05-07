import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ReportingService } from './reporting.service';
import { ReportMetadata } from './models/report.model';
import { GenerateReportInput, ReportListInput } from './dto/report-request.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver()
export class ReportingResolver {
  constructor(private readonly reportingService: ReportingService) {}

  /**
   * Generate a new report (Admin only)
   */
  @Mutation(() => ReportMetadata)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async generateReport(
    @Args('input') input: GenerateReportInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reportingService.generateReport(userId, input);
  }

  /**
   * Get all reports for the current user (Admin only)
   */
  @Query(() => [ReportMetadata])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getReports(
    @Args('input', { nullable: true }) input: ReportListInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reportingService.getReports(userId, input);
  }

  /**
   * Get a report by ID (Admin only)
   */
  @Query(() => ReportMetadata)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getReportById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reportingService.getReportById(userId, id);
  }

  /**
   * Delete a report (Admin only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteReport(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reportingService.deleteReport(userId, id);
  }
}
