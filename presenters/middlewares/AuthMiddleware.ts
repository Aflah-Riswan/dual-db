import type { NextFunction, Request, Response } from "express";
import type { ITokenService } from "../../domain/services/service.token.js";



declare global {
  namespace Express { interface Request { user?: { id: number; email: string; role: string; }; } }
}

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access Denied.' });
      return;
    }
    try {
      req.user = this.tokenService.verifyToken(authHeader.split(' ')[1]!);
      next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid Token.' });
    }
  };

  authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Forbidden.' });
        return;
      }
      next();
    };
  };
}