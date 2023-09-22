import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.header('x-token');
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        } else {
          req['user'] = decoded;
          next();
        }
      });
      return res.status(200).json({
        ok: true,
        id: req['user']['id'],
        token: this.getJWTToken({
          id: req['user']['id'],
          fullName: req['user']['fullName'],
        }),
      });
    } else {
      return res.status(401).json({ message: 'No token provided' });
    }
  }

  private getJWTToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
