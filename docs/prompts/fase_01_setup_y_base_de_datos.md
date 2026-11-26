# 01 — Setup del Monorepo y Base de Datos (Prisma + PostgreSQL)

Lee primero `docs/prompts/00-arquitectura-y-reglas.md`. Ejecuta únicamente esta fase y detente al completar la verificación.

---

## 1. Inicialización del Backend (`server/`)

1. Crea la carpeta `server/` e inicializa un proyecto Node.js con TypeScript.
2. Instala las dependencias:
   * Producción: `express`, `cors`, `dotenv`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`, `multer`, `pdf-parse`, `@google/genai`.
   * Desarrollo: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`, `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/multer`, `@types/pdf-parse`, `prisma`.
3. Configura `tsconfig.json` y los scripts en `server/package.json`:
   * `"dev": "tsx watch src/index.ts"`
   * `"build": "tsc"`
   * `"seed": "tsx prisma/seed.ts"`
4. Crea `server/.env.example` y `server/.env` con:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tokenservice_db?schema=public"
   JWT_SECRET="tokenservice_super_secreto_cambiar_en_produccion"
   GEMINI_API_KEY=""
   ```
   *(Nota: Si la conexión a PostgreSQL falla porque el usuario tiene otra contraseña local, avísale al usuario cómo ajustar `DATABASE_URL` antes de migrar).*

---

## 2. Diseño de `server/prisma/schema.prisma`

Crea el esquema con PostgreSQL como proveedor y los siguientes 6 modelos:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model UsuarioAdmin {
  id       Int      @id @default(autoincrement())
  nombre   String
  email    String   @unique
  password String
  creadoEn DateTime @default(now())
}

model Conocimiento {
  id          Int      @id @default(autoincrement())
  titulo      String
  categoria   String   // "Servicios", "Planes", "Soporte", "Empresa", "Documento", "Confidencial"
  contenido   String   @db.Text
  urlGuia     String?  // Ruta pública opcional: "/", "/servicios", "/planes", "/soporte", "/cotizar"
  fuente      String   @default("manual") // "manual", "pdf", "txt"
  esPublico   Boolean  @default(true)
  creadoEn    DateTime @default(now())
  actualizado DateTime @updatedAt
}

model ReglaRestriccion {
  id          Int      @id @default(autoincrement())
  descripcion String   @db.Text
  activa      Boolean  @default(true)
  creadoEn    DateTime @default(now())
}

model Conversacion {
  id       String    @id @default(uuid())
  creadaEn DateTime  @default(now())
  mensajes Mensaje[]
}

model Mensaje {
  id             Int          @id @default(autoincrement())
  rol            String       // "user" o "model"
  texto          String       @db.Text
  rutaSugerida   String?
  conversacionId String
  conversacion   Conversacion @relation(fields: [conversacionId], references: [id], onDelete: Cascade)
  creadoEn       DateTime     @default(now())
}

model SolicitudContacto {
  id        Int      @id @default(autoincrement())
  tipo      String   // "SOPORTE" o "COTIZACION"
  nombre    String
  email     String
  telefono  String?
  empresa   String?
  asunto    String
  mensaje   String   @db.Text
  estado    String   @default("PENDIENTE") // "PENDIENTE", "EN_PROCESO", "RESUELTO"
  creadoEn  DateTime @default(now())
}
```

---

## 3. Script de Semilla (`server/prisma/seed.ts`)

Crea un `seed.ts` idempotente (que pueda ejecutarse sin duplicar datos innecesariamente) que inserte:

1. **Usuario Administrador:**
   * Email: `admin@tokenservice.com`
   * Contraseña hasheada con `bcryptjs`: `Admin123!`
2. **8 artículos de `Conocimiento` con `esPublico: true`** cubriendo:
   * Quién es TokenService (consultora de soporte TI, redes, servidores Linux/Windows y ciberseguridad en Lima, Perú) -> `urlGuia: "/"`
   * Servicios de Infraestructura de Redes y Cableado Estructurado -> `urlGuia: "/servicios"`
   * Administración de Servidores Linux/Windows y Backups -> `urlGuia: "/servicios"`
   * Ciberseguridad Perimetral, Firewalls y Auditoría Básica -> `urlGuia: "/servicios"`
   * Plan Básico (hasta 10 equipos, soporte remoto L-V, SLA 8h, S/ 650/mes) -> `urlGuia: "/planes"`
   * Plan Pyme (hasta 30 equipos, soporte remoto + 2 visitas mensuales, SLA 4h, S/ 1,450/mes) -> `urlGuia: "/planes"`
   * Plan Corporativo (equipos ilimitados, monitoreo 24/7, SLA 1h, precio a medida) -> `urlGuia: "/planes"`
   * Horarios de atención, apertura de tickets y contacto directo por WhatsApp -> `urlGuia: "/soporte"`
   * Proceso para solicitar presupuestos personalizados -> `urlGuia: "/cotizar"`
3. **2 artículos de `Conocimiento` con `esPublico: false` (Confidenciales para pruebas de seguridad):**
   * *"Lista interna de clientes VIP y contratos"* (ej. Banco Andino, Minera del Sur, margen neto interno 42%).
   * *"Credenciales y arquitectura interna del servidor"* (ej. servidor PostgreSQL interno, IP de gestión 10.20.30.40, rutas administrativas).
4. **4 registros de `ReglaRestriccion` con `activa: true`:**
   * *"No ofrecer descuentos no autorizados; derivar cualquier negociación de precios a /cotizar."*
   * *"No brindar soporte técnico paso a paso ni comandos de reparación gratuita por el chat; invitar al usuario a abrir un ticket en /soporte."*
   * *"No opinar ni hacer comparaciones con otras empresas competidoras de TI."*
   * *"Responder siempre en español, de forma clara, profesional y en máximo 2 párrafos cortos."*

---

## 4. Inicialización del Frontend (`client/`)

1. Crea `client/` usando Vite con plantilla `react-ts`.
2. Instala `react-router-dom`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer` (o `@tailwindcss/vite` si usas Tailwind v4, manteniendo compatibilidad limpia).
3. Configura los colores base del tema claro dorado (`#FDFBF7`, `#F7F1E3`, `#D97706`, `#92400E`) y asegúrate de que `client/src/index.css` cargue correctamente las directivas de Tailwind.
4. Crea `client/.env.example` y `client/.env`:
   ```env
   VITE_API_URL="http://localhost:4000/api"
   VITE_WHATSAPP_NUMBER="51999999999"
   ```

---

## Verificación antes de terminar la Fase 1

1. Ejecuta `npx prisma migrate dev --name init` y `npm run seed` en `server/` (si PostgreSQL local requiere credenciales distintas del usuario, pídeselas brevemente).
2. Verifica que `client/` compile sin errores (`npm run build` o arranque de Vite).
3. Muéstrame un resumen breve de las tablas creadas y espera mi confirmación para pasar a la Fase 2.