import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { HttpError } from '../config/env';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversaciones = await prisma.conversacion.findMany({
        take: 30,
        orderBy: { creadaEn: 'desc' },
        include: {
          _count: {
            select: { mensajes: true },
          },
          mensajes: {
            take: 1,
            orderBy: { creadoEn: 'asc' },
            select: {
              texto: true,
              rol: true,
              creadoEn: true,
            },
          },
        },
      });

      const resumen = conversaciones.map((conv) => ({
        id: conv.id,
        creadaEn: conv.creadaEn,
        totalMensajes: conv._count.mensajes,
        primerMensaje: conv.mensajes[0]?.texto ?? null,
      }));

      res.json(resumen);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id?.trim();

      if (!id) {
        throw new HttpError(400, 'Debes indicar el ID de la conversación.');
      }

      const conversacion = await prisma.conversacion.findUnique({
        where: { id },
        include: {
          mensajes: {
            orderBy: { creadoEn: 'asc' },
          },
        },
      });

      if (!conversacion) {
        throw new HttpError(404, 'Conversación no encontrada.');
      }

      res.json(conversacion);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
