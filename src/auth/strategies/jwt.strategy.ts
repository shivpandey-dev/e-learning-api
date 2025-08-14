import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtUserPayload {
  userId: string;
  role: string; // singular role
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtUserPayload) {
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const role = (payload.role || '').toLowerCase();
    const roles = role ? [role] : [];

    // This becomes req.user
    return {
      userId: payload.userId,
      email: payload.email,
      role,
      roles,
    };
  }
}
