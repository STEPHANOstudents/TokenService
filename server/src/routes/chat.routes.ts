import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { HttpError } from '../config/env';
import { generarRespuestaChat } from '../services/gemini.service';

const router = Router();

const MAX_MENSAJE_LENGTH = 1000;

interface ChatBody {
  mensaje?: unknown;
  conversacionId?: unknown;
}

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ChatBody;

      if (typeof body.mensaje !== 'string') {
        throw new HttpError(400, 'El mensaje debe ser una cadena de texto.');
      }

      const mensajeLimpio = body.mensaje.trim();

      if (!mensajeLimpio) {
        throw new HttpError(400, 'El mensaje no puede estar vacío.');
      }

      if (mensajeLimpio.length > MAX_MENSAJE_LENGTH) {
        throw new HttpError(
          400,
          `El mensaje no puede superar los ${MAX_MENSAJE_LENGTH} caracteres.`
        );
      }

      const conversacionIdSolicitado =
        typeof body.conversacionId === 'string' && body.conversacionId.trim()
          ? body.conversacionId.trim()
          : null;

      let conversacion = conversacionIdSolicitado
        ? await prisma.conversacion.findUnique({
            where: { id: conversacionIdSolicitado },
          })
        : null;

      if (!conversacion) {
        conversacion = await prisma.conversacion.create({ data: {} });
      }

      const [conocimientosPublicos, reglasActivas, ultimosMensajesDesc] =
        await Promise.all([
          prisma.conocimiento.findMany({
            where: { esPublico: true },
            orderBy: { id: 'asc' },
          }),
          prisma.reglaRestriccion.findMany({
            where: { activa: true },
            orderBy: { id: 'asc' },
          }),
          prisma.mensaje.findMany({
            where: { conversacionId: conversacion.id },
            orderBy: { creadoEn: 'desc' },
            take: 6,
          }),
        ]);

      const historialReciente = ultimosMensajesDesc.reverse();

      const resultadoIA = await generarRespuestaChat({
        mensajeUsuario: mensajeLimpio,
        historialReciente,
        conocimientosPublicos,
        reglasActivas,
      });

      const ahora = new Date();
      const instanteRespuesta = new Date(ahora.getTime() + 1);

      await prisma.$transaction([
        prisma.mensaje.create({
          data: {
            conversacionId: conversacion.id,
            rol: 'user',
            texto: mensajeLimpio,
            rutaSugerida: null,
            creadoEn: ahora,
          },
        }),
        prisma.mensaje.create({
          data: {
            conversacionId: conversacion.id,
            rol: 'model',
            texto: resultadoIA.respuesta,
            rutaSugerida: resultadoIA.rutaSugerida,
            creadoEn: instanteRespuesta,
          },
        }),
      ]);

      res.json({
        conversacionId: conversacion.id,
        respuesta: resultadoIA.respuesta,
        rutaSugerida: resultadoIA.rutaSugerida,
        textoBoton: resultadoIA.textoBoton,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:conversacionId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversacionId = req.params.conversacionId?.trim();

      if (!conversacionId) {
        throw new HttpError(400, 'Debes indicar un conversacionId válido.');
      }

      const conversacion = await prisma.conversacion.findUnique({
        where: { id: conversacionId },
        include: {
          mensajes: {
            orderBy: { creadoEn: 'asc' },
            select: {
              id: true,
              rol: true,
              texto: true,
              rutaSugerida: true,
              creadoEn: true,
            },
          },
        },
      });

      if (!conversacion) {
        throw new HttpError(404, 'Conversación no encontrada.');
      }

      res.json({
        conversacionId: conversacion.id,
        creadaEn: conversacion.creadaEn,
        mensajes: conversacion.mensajes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
