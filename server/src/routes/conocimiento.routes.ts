import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import multer from 'multer';
import { prisma } from '../config/prisma';
import { HttpError } from '../config/env';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  extraerTextoDeArchivo,
  MAX_FILE_SIZE_BYTES,
} from '../services/parser.service';

const router = Router();

const RUTAS_PUBLICAS_VALIDAS = new Set<string>([
  '/',
  '/servicios',
  '/planes',
  '/soporte',
  '/cotizar',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

function parseId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El identificador proporcionado no es válido.');
  }
  return id;
}

function normalizarUrlGuia(rawUrl: unknown): string | null {
  if (rawUrl === undefined || rawUrl === null) {
    return null;
  }
  if (typeof rawUrl !== 'string') {
    throw new HttpError(400, 'La ruta guía debe ser una cadena de texto.');
  }
  const limpia = rawUrl.trim();
  if (!limpia) {
    return null;
  }
  if (!RUTAS_PUBLICAS_VALIDAS.has(limpia)) {
    throw new HttpError(
      400,
      'Ruta guía no permitida. Solo se aceptan rutas públicas: /, /servicios, /planes, /soporte o /cotizar.'
    );
  }
  return limpia;
}

function parseBooleanInput(valor: unknown, valorPorDefecto: boolean): boolean {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const lower = valor.trim().toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  return valorPorDefecto;
}

// Todas las rutas de conocimiento son exclusivas del panel administrador
router.use(authMiddleware);

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoria =
        typeof req.query.categoria === 'string'
          ? req.query.categoria.trim()
          : '';
      const busqueda =
        typeof req.query.q === 'string'
          ? req.query.q.trim()
          : typeof req.query.busqueda === 'string'
            ? req.query.busqueda.trim()
            : '';
      const esPublicoParam =
        typeof req.query.esPublico === 'string'
          ? req.query.esPublico.trim().toLowerCase()
          : '';

      const where: Prisma.ConocimientoWhereInput = {};

      if (categoria && categoria !== 'Todas') {
        where.categoria = categoria;
      }

      if (esPublicoParam === 'true') {
        where.esPublico = true;
      } else if (esPublicoParam === 'false') {
        where.esPublico = false;
      }

      if (busqueda) {
        where.OR = [
          { titulo: { contains: busqueda, mode: 'insensitive' } },
          { contenido: { contains: busqueda, mode: 'insensitive' } },
          { categoria: { contains: busqueda, mode: 'insensitive' } },
        ];
      }

      const registros = await prisma.conocimiento.findMany({
        where,
        orderBy: { actualizado: 'desc' },
      });

      res.json(registros);
    } catch (error) {
      next(error);
    }
  }
);

interface CrearConocimientoBody {
  titulo?: unknown;
  categoria?: unknown;
  contenido?: unknown;
  urlGuia?: unknown;
  esPublico?: unknown;
}

router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CrearConocimientoBody;

      if (typeof body.titulo !== 'string' || !body.titulo.trim()) {
        throw new HttpError(400, 'El título del artículo es obligatorio.');
      }
      if (typeof body.categoria !== 'string' || !body.categoria.trim()) {
        throw new HttpError(400, 'La categoría es obligatoria.');
      }
      if (typeof body.contenido !== 'string' || !body.contenido.trim()) {
        throw new HttpError(400, 'El contenido del artículo es obligatorio.');
      }

      const esPublico = parseBooleanInput(body.esPublico, true);
      const urlGuia = esPublico ? normalizarUrlGuia(body.urlGuia) : null;

      const creado = await prisma.conocimiento.create({
        data: {
          titulo: body.titulo.trim(),
          categoria: body.categoria.trim(),
          contenido: body.contenido.trim(),
          urlGuia,
          fuente: 'manual',
          esPublico,
        },
      });

      res.status(201).json(creado);
    } catch (error) {
      next(error);
    }
  }
);

interface UploadConocimientoBody {
  titulo?: unknown;
  categoria?: unknown;
  urlGuia?: unknown;
  esPublico?: unknown;
}

router.post(
  '/upload',
  upload.single('archivo'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new HttpError(
          400,
          'Debes adjuntar un archivo .pdf o .txt en el campo "archivo".'
        );
      }

      const body = req.body as UploadConocimientoBody;

      const titulo =
        typeof body.titulo === 'string' && body.titulo.trim()
          ? body.titulo.trim()
          : req.file.originalname.replace(/\.(pdf|txt)$/i, '').trim();

      if (!titulo) {
        throw new HttpError(400, 'El título del documento es obligatorio.');
      }

      const categoria =
        typeof body.categoria === 'string' && body.categoria.trim()
          ? body.categoria.trim()
          : 'Documento';

      const esPublico = parseBooleanInput(body.esPublico, true);
      const urlGuia = esPublico ? normalizarUrlGuia(body.urlGuia) : null;

      const { texto, fuente, caracteresExtraidos } =
        await extraerTextoDeArchivo(req.file);

      const registro = await prisma.conocimiento.create({
        data: {
          titulo,
          categoria,
          contenido: texto,
          urlGuia,
          fuente,
          esPublico,
        },
      });

      res.status(201).json({
        registro,
        caracteresExtraidos,
      });
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
      const body = req.body as CrearConocimientoBody;

      const existente = await prisma.conocimiento.findUnique({
        where: { id },
      });

      if (!existente) {
        throw new HttpError(404, 'Registro de conocimiento no encontrado.');
      }

      const data: Prisma.ConocimientoUpdateInput = {};

      if (body.titulo !== undefined) {
        if (typeof body.titulo !== 'string' || !body.titulo.trim()) {
          throw new HttpError(400, 'El título no puede estar vacío.');
        }
        data.titulo = body.titulo.trim();
      }

      if (body.categoria !== undefined) {
        if (typeof body.categoria !== 'string' || !body.categoria.trim()) {
          throw new HttpError(400, 'La categoría no puede estar vacía.');
        }
        data.categoria = body.categoria.trim();
      }

      if (body.contenido !== undefined) {
        if (typeof body.contenido !== 'string' || !body.contenido.trim()) {
          throw new HttpError(400, 'El contenido no puede estar vacío.');
        }
        data.contenido = body.contenido.trim();
      }

      const nuevoEsPublico =
        body.esPublico !== undefined
          ? parseBooleanInput(body.esPublico, existente.esPublico)
          : existente.esPublico;

      if (body.esPublico !== undefined) {
        data.esPublico = nuevoEsPublico;
      }

      if (!nuevoEsPublico) {
        data.urlGuia = null;
      } else if (body.urlGuia !== undefined) {
        data.urlGuia = normalizarUrlGuia(body.urlGuia);
      }

      const actualizado = await prisma.conocimiento.update({
        where: { id },
        data,
      });

      res.json(actualizado);
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

      const existente = await prisma.conocimiento.findUnique({
        where: { id },
      });

      if (!existente) {
        throw new HttpError(404, 'Registro de conocimiento no encontrado.');
      }

      await prisma.conocimiento.delete({ where: { id } });

      res.json({ ok: true, mensaje: 'Registro eliminado correctamente.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
