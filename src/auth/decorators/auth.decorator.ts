import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // relative path inside auth
import { RolesGuard } from '../guards/roles.guard'; // moved here

export const ROLES_KEY = 'roles';

export const Auth = (...roles: string[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
