<p align="center">
  <img src="./tokenIconIA.png" alt="TokenService Logo" width="92" />
</p>

<h1 align="center">TokenService</h1>

<p align="center">
  <strong>Plataforma Web Corporativa de Soporte TI, Redes, Servidores y Ciberseguridad con Asistente Virtual IA, Base de Conocimiento Dinámica y Guardrails en Tiempo Real.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=1C1917" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma_ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="PostgreSQL Prisma" />
  <img src="https://img.shields.io/badge/Google_Gemini-3.8_Flash-D97706?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini AI" />
</p>

---

## Tabla de Contenidos

1. [Contexto y Propósito del Proyecto](#1-contexto-y-propósito-del-proyecto)
2. [Características Principales](#2-características-principales)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura y Estructura del Monorepo](#4-arquitectura-y-estructura-del-monorepo)
5. [Cómo Funciona el Motor de IA y los Guardrails](#5-cómo-funciona-el-motor-de-ia-y-los-guardrails)
6. [Modelo de Datos (PostgreSQL + Prisma)](#6-modelo-de-datos-postgresql--prisma)
7. [Referencia de la API REST](#7-referencia-de-la-api-rest)
8. [Instalación y Ejecución Local](#8-instalación-y-ejecución-local)
9. [Despliegue en Producción (Render + Vercel)](#9-despliegue-en-producción-render--vercel)
10. [Guía de Demo y Sustentación](#10-guía-de-demo-y-sustentación)

---

## 1. Contexto y Propósito del Proyecto

**TokenService** nace como una solución web full-stack para una empresa consultora de **Soporte TI, Infraestructura de Redes, Administración de Servidores y Ciberseguridad** en Lima, Perú.

### ¿Por qué se construyó?
En el sector de servicios tecnológicos empresariales existen tres retos recurrentes en la atención digital:
1. **Información desactualizada en chatbots tradicionales:** Muchos asistentes tienen respuestas rígidas o hardcodeadas que requieren volver a programar el sitio cada vez que cambia un plan, un horario o un servicio.
2. **Riesgo de filtración de datos sensibles y *prompt injection*:** Conectar un LLM directamente a documentos corporativos sin controles adecuados puede exponer información confidencial, precios internos, arquitectura de servidores o instrucciones del sistema.
3. **Fricción en la conversión y el soporte:** Los visitantes necesitan respuestas inmediatas sin registrarse, navegación guiada hacia los formularios clave y canales directos de contacto (tickets, cotizaciones y WhatsApp).

**TokenService** resuelve estos problemas mediante una arquitectura donde el administrador gestiona en tiempo real la base de conocimiento (manual o desde archivos `.pdf`/`.txt`), clasifica cada registro como **Público** o **Confidencial** y activa o desactiva **reglas de comportamiento (guardrails)** sin reiniciar ni redeployar el servidor.

---

## 2. Características Principales

### Portal Corporativo Público (sin registro)
* **Identidad visual clara con acentos dorados y bronce** (`#FDFBF7`, `#FFFFFF`, `#F7F1E3`, `#D97706`, `#92400E`), completamente responsiva.
* **5 vistas públicas:** Inicio (`/`), Catálogo de Servicios (`/servicios`), Planes de Mantenimiento y SLA (`/planes`), Centro de Soporte (`/soporte`) y Solicitud de Cotización (`/cotizar`).
* **Formularios conectados a PostgreSQL:** Registro persistente de tickets de soporte (`SOPORTE`) y solicitudes comerciales (`COTIZACION`).
* **Integración dinámica con WhatsApp:** Tanto en `/soporte` como en `/cotizar`, los botones de WhatsApp generan automáticamente un enlace `https://wa.me/...` con el mensaje prellenado en tiempo real según el nombre, empresa, servicio/plan o asunto ingresado por el visitante.
* **Widget de Chat IA flotante y anónimo:** Restaura el historial del visitante mediante `localStorage`, ofrece chips de preguntas rápidas, botón de nueva conversación y renderiza **botones interactivos de navegación SPA** que llevan al usuario a la sección correspondiente sin recargar la página ni perder la conversación.

### Panel de Administración Privado (`/admin/*`, protegido con JWT)
* **Base de Conocimiento (`/admin/conocimiento`):**
  * Tarjetas métricas (Total, Públicos visibles para la IA y Confidenciales bloqueados).
  * Alta y edición manual de artículos con categoría, ruta pública sugerida y estado de visibilidad.
  * **Carga automática de documentos `.pdf` y `.txt`** (hasta 5 MB) con extracción y normalización de texto (`multer` en memoria + `pdf-parse`).
  * Interruptor rápido en un clic para alternar cualquier registro entre **Público** y **Confidencial**.
* **Restricciones IA (`/admin/restricciones`):** Creación, activación/pausa instantánea y eliminación de reglas corporativas que modifican el comportamiento del bot desde el siguiente mensaje.
* **Auditoría de Historial (`/admin/historial`):** Vista maestro-detalle de las últimas 30 conversaciones anónimas, mostrando preguntas, respuestas y rutas sugeridas por Gemini.
* **Gestión de Tickets y Cotizaciones (`/admin/solicitudes`):** Bandeja con filtros (`Todos`, `SOPORTE`, `COTIZACION`) y cambio de estado (`PENDIENTE`, `EN_PROCESO`, `RESUELTO`).

---

## 3. Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend (`client/`)** | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM v6, Lucide React |
| **Backend (`server/`)** | Node.js, Express, TypeScript (`tsx` en desarrollo), CORS, dotenv |
| **Base de Datos y ORM** | PostgreSQL, Prisma ORM v6 |
| **Inteligencia Artificial** | SDK oficial `@google/genai` con **`gemini-3.8-flash`** (y respaldo automático ante picos 503/504) |
| **Seguridad y Archivos** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `multer` (memoryStorage), `pdf-parse` |
| **Producción** | Render (Web Service Node + Managed PostgreSQL) y Vercel (Frontend SPA) |

---

## 4. Arquitectura y Estructura del Monorepo

El proyecto está organizado como un monorepo con separación clara entre el cliente SPA y la API REST:

```text
TokenService/
├── README.md
├── DEMO-SUSTENTACION.md          # Guion paso a paso de 5 pruebas en vivo
├── tokenIconIA.png               # Emblema corporativo principal
├── docs/prompts/                 # Documentación de diseño y fases del proyecto
├── server/                       # Backend Express + Prisma + Gemini
│   ├── prisma/
│   │   ├── migrations/           # Migraciones SQL versionadas de PostgreSQL
│   │   ├── schema.prisma         # Esquema relacional (6 modelos)
│   │   └── seed.ts               # Semilla idempotente (admin, conocimiento y reglas)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts            # Variables de entorno tipadas y clase HttpError
│   │   │   └── prisma.ts         # Instancia singleton de PrismaClient
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts # Verificación de JWT Bearer
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── conocimiento.routes.ts
│   │   │   ├── historial.routes.ts
│   │   │   ├── restricciones.routes.ts
│   │   │   └── solicitudes.routes.ts
│   │   ├── services/
│   │   │   ├── gemini.service.ts # Motor de IA, guardrails y validación JSON estricta
│   │   │   └── parser.service.ts # Extracción de texto desde archivos .pdf y .txt
│   │   └── index.ts              # Configuración de Express, rutas y errores globales
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── client/                       # Frontend React + Vite + Tailwind CSS
    ├── public/
    │   └── tokenIconIA.png       # Ícono y favicon servido en producción
    ├── src/
    │   ├── components/
    │   │   ├── ChatWidget.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── TokenServiceLogo.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx   # Estado de sesión JWT del administrador
    │   ├── pages/
    │   │   ├── public/           # Home, Servicios, Planes, Soporte, Cotizar
    │   │   └── admin/            # AdminLogin, AdminLayout, AdminConocimiento,
    │   │                         # AdminRestricciones, AdminHistorial, AdminSolicitudes
    │   ├── services/
    │   │   └── api.ts            # Cliente HTTP centralizado y tipado
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── .env.example
    ├── tailwind.config.js
    ├── vercel.json               # Rewrites SPA para React Router en Vercel
    └── package.json
```

### Mapa de Rutas de la Aplicación
* **Rutas Públicas (permitidas para sugerencias del bot):** `/`, `/servicios`, `/planes`, `/soporte`, `/cotizar`.
* **Rutas Privadas (ocultas y bloqueadas para el bot):** `/admin/login`, `/admin/conocimiento`, `/admin/restricciones`, `/admin/historial`, `/admin/solicitudes`.

---

## 5. Cómo Funciona el Motor de IA y los Guardrails

El corazón técnico de TokenService se encuentra en [`server/src/services/gemini.service.ts`](server/src/services/gemini.service.ts) y [`server/src/routes/chat.routes.ts`](server/src/routes/chat.routes.ts). Su arquitectura sigue un enfoque de **contexto dinámico con defensa en profundidad**:

```text
Visitante (ChatWidget)
   │  POST /api/chat { mensaje, conversacionId? }
   ▼
Backend Express (chat.routes.ts)
   ├─► Valida longitud (1..1000 caracteres) y recupera/crea Conversacion en PostgreSQL
   ├─► Consulta en paralelo (Promise.all):
   │     1. Conocimiento WHERE esPublico = true   (los registros confidenciales NUNCA salen de BD)
   │     2. ReglaRestriccion WHERE activa = true  (guardrails dinámicos del admin)
   │     3. Últimos 6 mensajes de la conversación (memoria conversacional acotada)
   ▼
Servicio Gemini (gemini.service.ts)
   ├─► Construye dinámicamente el `systemInstruction` con:
   │     • Identidad oficial de TokenService
   │     • Reglas de seguridad inquebrantables (anti-alucinación, anti-prompt injection,
   │       prohibición de revelar arquitectura, base de datos o rutas /admin)
   │     • Sección RESTRICCIONES DE LA EMPRESA (reglas activas de PostgreSQL)
   │     • Sección INFORMACIÓN OFICIAL DE TOKENSERVICE (solo artículos públicos)
   ├─► Invoca `@google/genai` con `responseMimeType: "application/json"` y `responseSchema` estricto:
   │     { respuesta: string, rutaSugerida: string | null, textoBoton: string | null }
   ├─► Resiliencia ante picos de demanda:
   │     • Modelo principal: `gemini-3.8-flash`
   │     • Respaldo automático ante 503/504 o timeout: `gemini-4-hydrogen` → `gemini-3.5-flash-lite`
   │     • Manejo dedicado de HTTP 429 (límite de tasa) con mensaje amigable en español
   └─► Sanitización defensiva en TypeScript:
         Si `rutaSugerida` no pertenece exactamente a ["/", "/servicios", "/planes", "/soporte", "/cotizar"],
         se fuerza a `null` junto con `textoBoton` antes de responder al cliente.
   │
   ▼
Persiste turno (user + model + rutaSugerida) en PostgreSQL y responde JSON limpio al frontend.
```

### Garantías de Seguridad Implementadas
1. **Aislamiento de datos confidenciales a nivel de consulta:** El filtro `where: { esPublico: true }` se aplica tanto en Prisma (`chat.routes.ts`) como de forma redundante en `gemini.service.ts`. Un documento marcado como confidencial jamás entra en el contexto del LLM.
2. **Protección contra *Prompt Injection*:** El `systemInstruction` ordena rechazar instrucciones que intenten anular reglas, revelar el prompt del sistema o solicitar acceso/información sobre `/admin`.
3. **Salida estructurada y validación de rutas:** Al combinar `responseSchema` con una lista blanca estricta en TypeScript (`RUTAS_PUBLICAS_PERMITIDAS`), el frontend nunca recibe enlaces inválidos ni rutas administrativas.

---

## 6. Modelo de Datos (PostgreSQL + Prisma)

El esquema definido en [`server/prisma/schema.prisma`](server/prisma/schema.prisma) consta de **6 modelos**:

* **`UsuarioAdmin`**: Credenciales de administradores (`email` único, contraseña hasheada con `bcryptjs`).
* **`Conocimiento`**: Artículos y documentos extraídos (`titulo`, `categoria`, `contenido`, `urlGuia`, `fuente`: `manual` | `pdf` | `txt`, `esPublico`).
* **`ReglaRestriccion`**: Reglas activables/desactivables que condicionan las respuestas del asistente.
* **`Conversacion`**: Sesiones de chat anónimas identificadas por UUID.
* **`Mensaje`**: Mensajes cronológicos (`rol`: `user` | `model`, `texto`, `rutaSugerida`) asociados con `onDelete: Cascade` a `Conversacion`.
* **`SolicitudContacto`**: Tickets de soporte (`SOPORTE`) y cotizaciones (`COTIZACION`) con seguimiento de estado (`PENDIENTE`, `EN_PROCESO`, `RESUELTO`).

---

## 7. Referencia de la API REST

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Verifica estado del servidor (`{ ok: true, servicio: "TokenService API" }`) |
| `POST` | `/api/chat` | Público | Envía un mensaje al asistente IA y persiste la conversación |
| `GET` | `/api/chat/:conversacionId` | Público | Recupera el historial anónimo de una sesión |
| `POST` | `/api/solicitudes` | Público | Registra un ticket de `SOPORTE` o solicitud de `COTIZACION` |
| `POST` | `/api/auth/login` | Público | Autentica al administrador y emite un token JWT (`12h`) |
| `GET` | `/api/auth/me` | JWT | Retorna los datos del administrador autenticado |
| `GET/POST/PUT/DELETE` | `/api/conocimiento` | JWT | CRUD completo de artículos de conocimiento |
| `POST` | `/api/conocimiento/upload` | JWT | Procesa archivos `.pdf` o `.txt` (máx. 5 MB) y extrae texto a la BD |
| `GET/POST/PUT/DELETE` | `/api/restricciones` | JWT | CRUD de reglas/guardrails activos e inactivos |
| `GET` | `/api/historial` y `/:id` | JWT | Lista las últimas 30 conversaciones y el hilo completo de mensajes |
| `GET/PATCH` | `/api/solicitudes` y `/:id` | JWT | Lista tickets/cotizaciones y actualiza su estado |

---

## 8. Instalación y Ejecución Local

### Prerrequisitos
* **Node.js** v20+ (recomendado v22+)
* **PostgreSQL** v14+ en ejecución local
* **API Key gratuita de Google AI Studio** ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Clonar el repositorio
```bash
git clone https://github.com/STEPHANOstudents/TokenService.git
cd TokenService
```

### 2. Configurar y levantar el Backend (`server/`)
```bash
cd server
npm install
```

Crea `server/.env` a partir de `server/.env.example`:
```env
PORT=4000
DATABASE_URL="postgresql://USUARIO:CONTRASENA@localhost:5432/tokenservice_db?schema=public"
JWT_SECRET="cambia_este_secreto_por_uno_seguro"
GEMINI_API_KEY="TU_GEMINI_API_KEY"
```

Aplica las migraciones, carga los datos iniciales (idempotente) e inicia el servidor:
```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```
El backend quedará disponible en `http://localhost:4000`.

### 3. Configurar y levantar el Frontend (`client/`)
En una segunda terminal:
```bash
cd client
npm install
```

Crea `client/.env` a partir de `client/.env.example`:
```env
VITE_API_URL="http://localhost:4000/api"
VITE_WHATSAPP_NUMBER="51999999999"
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```
La aplicación web quedará disponible en `http://localhost:5173`.

### Credenciales de Administrador por Defecto (Seed)
* **URL:** `/admin/login`
* **Correo:** `admin@tokenservice.com`
* **Contraseña:** `Admin123!`

---

## 9. Despliegue en Producción (Render + Vercel)

El repositorio incluye configuraciones listas para despliegue inmediato:

### Base de Datos + Backend en Render
1. Crear una instancia **PostgreSQL** en Render y copiar su **Internal Database URL**.
2. Crear un **Web Service (Runtime: Node)** conectado a este repositorio con:
   * **Root Directory:** `server`
   * **Build Command:** `npm install --include=dev && npm run build`
   * **Start Command:** `npm run start:prod` *(ejecuta `prisma migrate deploy`, `npm run seed` de forma idempotente y arranca `dist/index.js`)*
   * **Variables de entorno:** `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_VERSION=22`.
3. Verificar salud en `https://<tu-servicio>.onrender.com/api/health`. *(En el plan gratuito de Render puede configurarse un monitor HTTP externo sobre `/api/health` para evitar suspensión por inactividad).*

### Frontend en Vercel
1. Importar este repositorio en Vercel con:
   * **Root Directory:** `client`
   * **Framework Preset:** `Vite`
   * **Variables de entorno:**
     * `VITE_API_URL=https://<tu-servicio>.onrender.com/api`
     * `VITE_WHATSAPP_NUMBER=51XXXXXXXXX`
2. El archivo [`client/vercel.json`](client/vercel.json) ya configura las reglas de *rewrite* necesarias para que React Router funcione sin errores 404 al recargar cualquier ruta.

---

## 10. Guía de Demo y Sustentación

Para un guion paso a paso de las **5 demostraciones en vivo** (navegación asistida por IA, bloqueo de fuga de datos confidenciales y *prompt injection*, carga en vivo de `.pdf`/`.txt`, restricciones en tiempo real y auditoría de tickets/chats), consulta [`DEMO-SUSTENTACION.md`](DEMO-SUSTENTACION.md).
