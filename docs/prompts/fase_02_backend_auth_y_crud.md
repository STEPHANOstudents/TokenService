# 02 — Backend: Autenticación, CRUD de Conocimiento, Subida PDF/TXT y Solicitudes

Lee `docs/prompts/00-arquitectura-y-reglas.md` como referencia. Ejecuta únicamente esta fase y detente al completar la verificación.

---

## 1. Configuración base del servidor (`server/src/`)

1. **`src/config/prisma.ts`**: Instancia única (`singleton`) de `PrismaClient`.
2. **`src/index.ts`**:
   * Configura Express con `cors()` y `express.json()`.
   * Endpoint de salud `GET /api/health` que devuelva `{ ok: true, servicio: "TokenService API" }`.
   * Monta las rutas bajo `/api/...`.
   * Middleware global de manejo de errores para devolver JSON limpio.

---

## 2. Autenticación del Administrador (`auth`)

1. **`src/middlewares/auth.middleware.ts`**:
   * Lee el header `Authorization: Bearer <token>`.
   * Verifica el JWT con `process.env.JWT_SECRET`.
   * Adjunta `{ id, email, nombre }` en `req.admin` (extendiendo el tipo `Request` de Express).
   * Devuelve `401` si falta o es inválido.
2. **`src/routes/auth.routes.ts`**:
   * `POST /api/auth/login`: Valida `email` y `password` contra `UsuarioAdmin` usando `bcryptjs.compare`. Devuelve `{ token, admin: { id, nombre, email } }` con expiración de `12h`.
   * `GET /api/auth/me` (protegida): Devuelve los datos del admin autenticado.

---

## 3. CRUD de Conocimiento + Subida de `.pdf` y `.txt`

1. **`src/services/parser.service.ts`**:
   * Función para extraer texto limpio desde un `Buffer` de archivo:
     * Si es `.txt` (`text/plain`): `buffer.toString('utf-8')`.
     * Si es `.pdf` (`application/pdf`): usar `pdf-parse` para extraer el texto y normalizar espacios/saltos de línea excesivos.
   * Validar que el archivo no esté vacío y limitar el tamaño máximo a **5 MB**.
2. **`src/routes/conocimiento.routes.ts`** (todas las rutas protegidas con `authMiddleware`):
   * `GET /api/conocimiento`: Lista todos los registros (públicos y confidenciales), ordenados por `actualizado desc`, con filtro opcional por categoría o búsqueda de texto.
   * `POST /api/conocimiento`: Crea un artículo manual (`titulo`, `categoria`, `contenido`, `urlGuia`, `esPublico`).
   * `POST /api/conocimiento/upload`: Usa `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })`. Recibe un archivo `.pdf` o `.txt` en el campo `archivo`, junto con `titulo`, `categoria`, `urlGuia` (opcional) y `esPublico` (`"true"` / `"false"`). Extrae el texto con `parser.service.ts`, guarda el registro en PostgreSQL con `fuente: "pdf"` o `"txt"`, y devuelve el registro creado junto con la cantidad de caracteres extraídos.
   * `PUT /api/conocimiento/:id`: Edita un registro existente (incluyendo alternar `esPublico` rápidamente).
   * `DELETE /api/conocimiento/:id`: Elimina un registro.

---

## 4. CRUD de Restricciones (`restricciones.routes.ts`)

Todas las rutas protegidas con `authMiddleware`:
* `GET /api/restricciones`: Lista todas las reglas ordenadas por `creadoEn desc`.
* `POST /api/restricciones`: Crea una nueva regla (`descripcion`, `activa`).
* `PUT /api/restricciones/:id`: Actualiza `descripcion` o alterna `activa`.
* `DELETE /api/restricciones/:id`: Elimina la regla.

---

## 5. Solicitudes de Contacto y Auditoría de Historial

1. **`src/routes/solicitudes.routes.ts`**:
   * `POST /api/solicitudes` (**PÚBLICA**, sin login): Permite a cualquier visitante enviar un ticket de soporte (`tipo: "SOPORTE"`) o una cotización (`tipo: "COTIZACION"`). Valida campos obligatorios (`nombre`, `email`, `asunto`, `mensaje`).
   * `GET /api/solicitudes` (protegida): Lista todas las solicitudes ordenadas por `creadoEn desc`.
   * `PATCH /api/solicitudes/:id` (protegida): Actualiza el `estado` (`PENDIENTE`, `EN_PROCESO`, `RESUELTO`).
2. **`src/routes/historial.routes.ts`** (protegida):
   * `GET /api/historial`: Devuelve las últimas 30 conversaciones con su conteo de mensajes y fecha.
   * `GET /api/historial/:id`: Devuelve todos los mensajes ordenados cronológicamente de una conversación específica.

---

## Verificación antes de terminar la Fase 2

1. Arranca el servidor (`npm run dev` en `server/`) y comprueba que no haya errores de TypeScript (`npx tsc --noEmit`).
2. Haz una prueba rápida con `curl` o script de verificación para:
   * `GET /api/health`
   * `POST /api/auth/login` con `admin@tokenservice.com` / `Admin123!`
   * `GET /api/conocimiento` usando el token JWT recibido.
3. Muéstrame los resultados y espera mi confirmación para pasar a la Fase 3.