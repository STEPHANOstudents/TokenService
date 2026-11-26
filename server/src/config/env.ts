import 'dotenv/config';

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
} as const;

if (!env.jwtSecret) {
  throw new Error('La variable de entorno JWT_SECRET es obligatoria.');
}
