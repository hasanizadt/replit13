import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, access is allowed
    }

    // For GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user) {
      return false; // No user found in request
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}