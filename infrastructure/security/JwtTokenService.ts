import jwt from 'jsonwebtoken';
import type { ITokenService, IUserPayload } from "../../domain/services/service.token.js";

export class JwtTokenService implements ITokenService {
  private readonly secret = process.env.JWT_SECRET || 'super_secret_key';

  generateToken(payload: IUserPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1d' });
  }
  verifyToken(token: string): IUserPayload {
    return jwt.verify(token, this.secret) as IUserPayload;
  }
}
