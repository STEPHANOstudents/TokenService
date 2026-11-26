import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env, HttpError } from '../config/env';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as LoginBody;

      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
      ) {
        throw new HttpError(400, 'Debes ingresar correo electrónico y contraseña.');
      }

      const emailNormalizado = email.trim().toLowerCase();

      const admin = await prisma.usuarioAdmin.findUnique({
        where: { email: emailNormalizado },
      });

      if (!admin) {
        throw new HttpError(401, 'Credenciales incorrectas.');
      }

      const passwordValido = await bcrypt.compare(password, admin.password);

      if (!passwordValido) {
        throw new HttpError(401, 'Credenciales incorrectas.');
      }

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          nombre: admin.nombre,
        },
        env.jwtSecret,
        { expiresIn: '12h' }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          email: admin.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new HttpError(401, 'No autorizado.');
      }

      const admin = await prisma.usuarioAdmin.findUnique({
        where: { id: req.admin.id },
        select: {
          id: true,
          nombre: true,
          email: true,
          creadoEn: true,
        },
      });

      if (!admin) {
        throw new HttpError(401, 'Cuenta de administrador no encontrada.');
      }

      res.json({ admin });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
