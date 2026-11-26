import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../config/env';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

function parseId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El identificador de la regla no es válido.');
  }
  return id;
}

interface ReglaBody {
  descripcion?: unknown;
  activa?: unknown;
}

router.use(authMiddleware);

router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reglas = await prisma.reglaRestriccion.findMany({
        orderBy: { creadoEn: 'desc' },
      });
      res.json(reglas);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ReglaBody;

      if (typeof body.descripcion !== 'string' || !body.descripcion.trim()) {
        throw new HttpError(
          400,
          'La descripción de la regla de restricción es obligatoria.'
        );
      }

      const activa = typeof body.activa === 'boolean' ? body.activa : true;

      const creada = await prisma.reglaRestriccion.create({
        data: {
          descripcion: body.descripcion.trim(),
          activa,
        },
      });

      res.status(201).json(creada);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const body = req.body as ReglaBody;

      const existente = await prisma.reglaRestriccion.findUnique({
        where: { id },
      });

      if (!existente) {
        throw new HttpError(404, 'Regla de restricción no encontrada.');
      }

      const data: Prisma.ReglaRestriccionUpdateInput = {};

      if (body.descripcion !== undefined) {
        if (typeof body.descripcion !== 'string' || !body.descripcion.trim()) {
          throw new HttpError(
            400,
            'La descripción de la regla no puede estar vacía.'
          );
        }
        data.descripcion = body.descripcion.trim();
      }

      if (body.activa !== undefined) {
        if (typeof body.activa !== 'boolean') {
          throw new HttpError(400, 'El campo "activa" debe ser booleano.');
        }
        data.activa = body.activa;
      }

      const actualizada = await prisma.reglaRestriccion.update({
        where: { id },
        data,
      });

      res.json(actualizada);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseId(req.params.id);

      const existente = await prisma.reglaRestriccion.findUnique({
        where: { id },
      });

      if (!existente) {
        throw new HttpError(404, 'Regla de restricción no encontrada.');
      }

      await prisma.reglaRestriccion.delete({ where: { id } });

      res.json({ ok: true, mensaje: 'Regla eliminada correctamente.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
