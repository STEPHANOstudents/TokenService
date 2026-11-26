import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../config/env';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const TIPOS_VALIDOS = new Set<string>(['SOPORTE', 'COTIZACION']);
const ESTADOS_VALIDOS = new Set<string>(['PENDIENTE', 'EN_PROCESO', 'RESUELTO']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El identificador de la solicitud no es válido.');
  }
  return id;
}

interface CrearSolicitudBody {
  tipo?: unknown;
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  empresa?: unknown;
  asunto?: unknown;
  mensaje?: unknown;
}

// Endpoint PÚBLICO para envío de tickets de soporte o cotizaciones
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CrearSolicitudBody;

      const tipo =
        typeof body.tipo === 'string' ? body.tipo.trim().toUpperCase() : '';
      if (!TIPOS_VALIDOS.has(tipo)) {
        throw new HttpError(
          400,
          'El tipo de solicitud debe ser "SOPORTE" o "COTIZACION".'
        );
      }

      if (typeof body.nombre !== 'string' || !body.nombre.trim()) {
        throw new HttpError(400, 'El nombre completo es obligatorio.');
      }

      if (
        typeof body.email !== 'string' ||
        !EMAIL_REGEX.test(body.email.trim())
      ) {
        throw new HttpError(
          400,
          'Debes proporcionar un correo electrónico válido.'
        );
      }

      if (typeof body.asunto !== 'string' || !body.asunto.trim()) {
        throw new HttpError(400, 'El asunto es obligatorio.');
      }

      if (typeof body.mensaje !== 'string' || !body.mensaje.trim()) {
        throw new HttpError(400, 'El mensaje o detalle es obligatorio.');
      }

      const telefono =
        typeof body.telefono === 'string' && body.telefono.trim()
          ? body.telefono.trim()
          : null;
      const empresa =
        typeof body.empresa === 'string' && body.empresa.trim()
          ? body.empresa.trim()
          : null;

      const creada = await prisma.solicitudContacto.create({
        data: {
          tipo,
          nombre: body.nombre.trim(),
          email: body.email.trim().toLowerCase(),
          telefono,
          empresa,
          asunto: body.asunto.trim(),
          mensaje: body.mensaje.trim(),
          estado: 'PENDIENTE',
        },
      });

      res.status(201).json(creada);
    } catch (error) {
      next(error);
    }
  }
);

// Endpoints PROTEGIDOS para el panel administrador
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipo =
        typeof req.query.tipo === 'string'
          ? req.query.tipo.trim().toUpperCase()
          : '';
      const estado =
        typeof req.query.estado === 'string'
          ? req.query.estado.trim().toUpperCase()
          : '';

      const where: Prisma.SolicitudContactoWhereInput = {};

      if (tipo && TIPOS_VALIDOS.has(tipo)) {
        where.tipo = tipo;
      }

      if (estado && ESTADOS_VALIDOS.has(estado)) {
        where.estado = estado;
      }

      const solicitudes = await prisma.solicitudContacto.findMany({
        where,
        orderBy: { creadoEn: 'desc' },
      });

      res.json(solicitudes);
    } catch (error) {
      next(error);
    }
  }
);

interface ActualizarEstadoBody {
  estado?: unknown;
}

router.patch(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const { estado } = req.body as ActualizarEstadoBody;

      const estadoNormalizado =
        typeof estado === 'string' ? estado.trim().toUpperCase() : '';

      if (!ESTADOS_VALIDOS.has(estadoNormalizado)) {
        throw new HttpError(
          400,
          'Estado inválido. Valores permitidos: PENDIENTE, EN_PROCESO o RESUELTO.'
        );
      }

      const existente = await prisma.solicitudContacto.findUnique({
        where: { id },
      });

      if (!existente) {
        throw new HttpError(404, 'Solicitud no encontrada.');
      }

      const actualizada = await prisma.solicitudContacto.update({
        where: { id },
        data: { estado: estadoNormalizado },
      });

      res.json(actualizada);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
