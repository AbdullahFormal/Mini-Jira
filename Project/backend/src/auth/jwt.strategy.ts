// src/auth/jwt.strategy.ts — tells Passport how to validate a JWT token
// When a request arrives with 'Authorization: Bearer <token>', this runs automatically

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Read the token from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  /**
   * Called after the token signature is verified.
   * The returned object is attached to req.user in controllers.
   */
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
