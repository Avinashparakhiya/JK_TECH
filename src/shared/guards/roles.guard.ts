import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // If no roles are required, grant access
    }

    // Extract user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtStrategy

    if (!user) {
      throw new HttpException('Authentication required. Please log in.', HttpStatus.UNAUTHORIZED);
    }

    // Check if user has at least one of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied: You do not have the necessary permissions to perform this action.');
    }

    return true; // Grant access if user has a required role
  }
}
