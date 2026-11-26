import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { env, HttpError } from './config/env';
import authRoutes from './routes/auth.routes';
import conocimientoRoutes from './routes/conocimiento.routes';
import restriccionesRoutes from './routes/restricciones.routes';
import solicitudesRoutes from './routes/solicitudes.routes';
import historialRoutes from './routes/historial.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    ok: true,
    servicio: 'TokenService API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/conocimiento', conocimientoRoutes);
app.use('/api/restricciones', restriccionesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/chat', chatRoutes);

// Ruta no encontrada
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Recurso o endpoint no encontrado.',
  });
});

// Middleware global de manejo de errores
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: 'El archivo excede el tamaño máximo permitido de 5 MB.',
        });
        return;
      }
      res.status(400).json({
        error: `Error al procesar el archivo adjunto: ${err.message}`,
      });
      return;
    }

    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status?: number }).status === 400
    ) {
      res.status(400).json({
        error: 'El cuerpo de la petición no contiene un JSON válido.',
      });
      return;
    }

    console.error('[Error no controlado]:', err);
    res.status(500).json({
      error: 'Ocurrió un error interno en el servidor. Inténtalo nuevamente.',
    });
  }
);

app.listen(env.port, () => {
  console.log(
    `[TokenService API] Servidor escuchando en http://localhost:${env.port}`
  );
});

export default app;
