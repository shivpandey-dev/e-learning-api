import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth.decorator'; // updated path
import type { Request } from 'express';

type ReqUser = {
  userId: string;
  email?: string;
  role?: string; // singular
  roles?: string[]; // normalized array
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // No roles specified → only JWT needed
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user?: ReqUser }>();
    const user = req.user;
    if (!user) return false;

    const normalized = new Set<string>(
      [...(user.roles ?? []), ...(user.role ? [user.role] : [])].map((r) =>
        r.toLowerCase(),
      ),
    );

    return requiredRoles.some((r) => normalized.has(r.toLowerCase()));
  }
}
