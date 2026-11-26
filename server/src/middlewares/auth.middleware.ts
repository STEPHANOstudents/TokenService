import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AdminPayload {
  id: number;
  email: string;
  nombre: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'No autorizado. Debes proporcionar un token de acceso válido.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      error: 'No autorizado. El token de acceso está vacío.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

    if (
      typeof decoded.id !== 'number' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.nombre !== 'string'
    ) {
      res.status(401).json({
        error: 'Token inválido. La estructura del payload no es válida.',
      });
      return;
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
    };

    next();
  } catch {
    res.status(401).json({
      error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.',
    });
  }
}
