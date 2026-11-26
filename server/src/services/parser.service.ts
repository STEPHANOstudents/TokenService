import path from 'node:path';
import pdfParse from 'pdf-parse';
import { HttpError } from '../config/env';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type FuenteDocumento = 'pdf' | 'txt';

export interface ResultadoExtraccion {
  texto: string;
  fuente: FuenteDocumento;
  caracteresExtraidos: number;
}

function normalizarTexto(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extraerTextoDeArchivo(
  archivo: Express.Multer.File
): Promise<ResultadoExtraccion> {
  if (!archivo || !archivo.buffer || archivo.size === 0) {
    throw new HttpError(400, 'El archivo está vacío o no se recibió correctamente.');
  }

  if (archivo.size > MAX_FILE_SIZE_BYTES) {
    throw new HttpError(
      400,
      'El archivo excede el tamaño máximo permitido de 5 MB.'
    );
  }

  const extension = path.extname(archivo.originalname).toLowerCase();
  const mime = archivo.mimetype.toLowerCase();

  const esTxt = mime === 'text/plain' || extension === '.txt';
  const esPdf = mime === 'application/pdf' || extension === '.pdf';

  if (!esTxt && !esPdf) {
    throw new HttpError(
      400,
      'Formato no soportado. Solo se permiten archivos .pdf o .txt.'
    );
  }

  let textoBruto = '';
  let fuente: FuenteDocumento;

  if (esTxt) {
    textoBruto = archivo.buffer.toString('utf-8');
    fuente = 'txt';
  } else {
    try {
      const resultadoPdf = await pdfParse(archivo.buffer);
      textoBruto = resultadoPdf.text ?? '';
      fuente = 'pdf';
    } catch {
      throw new HttpError(
        400,
        'No se pudo leer el archivo PDF. Verifica que no esté corrupto ni protegido con contraseña.'
      );
    }
  }

  const textoLimpio = normalizarTexto(textoBruto);

  if (!textoLimpio) {
    throw new HttpError(
      400,
      'El archivo no contiene texto extraíble. Si es un PDF escaneado como imagen, conviértelo primero a texto.'
    );
  }

  return {
    texto: textoLimpio,
    fuente,
    caracteresExtraidos: textoLimpio.length,
  };
}
