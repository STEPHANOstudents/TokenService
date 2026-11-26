# 00 — Arquitectura y Reglas Maestras: TokenService

Este es el documento de referencia global del proyecto **TokenService**. El agente debe respetarlo en todas las fases (`01` a `05`).

---

## 1. Propósito del Proyecto

**TokenService** es una aplicación web full-stack para una empresa ficticia de servicios de **Soporte TI, Redes, Servidores y Ciberseguridad**.
El núcleo técnico del proyecto es un **Chatbot Corporativo con Base de Conocimiento Dinámica y Restricciones (Guardrails)** impulsado por la API gratuita de **Gemini (`gemini-3.8-flash`)**:

* **Visitantes públicos (sin registro):** Cualquier usuario puede navegar la web y chatear con el asistente sin iniciar sesión. El bot responde usando únicamente la información pública de la empresa cargada en PostgreSQL y guía la navegación mediante botones interactivos.
* **Administradores (con login JWT):** Desde un panel privado (`/admin`), la empresa puede agregar/editar artículos de conocimiento, subir archivos `.pdf` o `.txt` para alimentar al bot automáticamente, marcar registros como **Públicos** o **Confidenciales**, definir reglas de restricción en tiempo real y auditar conversaciones y tickets.
* **Seguridad estricta:** La información confidencial nunca se envía a la IA (`where: { esPublico: true }`), y el `systemInstruction` bloquea intentos de *prompt injection*, filtración de arquitectura interna o temas fuera de dominio.

---

## 2. Stack Tecnológico Obligatorio

* **Frontend (`client/`):** React 18+, Vite, TypeScript, Tailwind CSS, React Router DOM, Lucide React (iconos).
* **Backend (`server/`):** Node.js, Express, TypeScript (`tsx` para desarrollo), Prisma ORM, PostgreSQL.
* **Inteligencia Artificial:** SDK oficial `@google/genai` con el modelo **`gemini-3.8-flash`**.
* **Autenticación y Archivos:** `jsonwebtoken`, `bcryptjs`, `multer` (en memoria), `pdf-parse`, `cors`, `dotenv`.

---

## 3. Identidad Visual y Paleta Corporativa (Tema Claro + Oro/Ámbar)

La interfaz debe ser **limpia, moderna y en tema claro**, inspirada en un emblema geométrico de brújula/medallón dorado metálico con núcleo ámbar luminoso y acentos bronce cálidos:

* **Fondo principal:** Crema marfil muy suave (`#FDFBF7`) y blanco puro (`#FFFFFF`) para tarjetas y contenedores.
* **Superficies secundarias:** Arena cálida (`#F7F1E3`).
* **Bordes:** Dorado muy suave (`#EBDCC0`).
* **Color Primario (Marca):** Ámbar dorado (`#D97706` / `#F59E0B`), con gradientes dorados sutiles (`from-amber-400 via-amber-500 to-amber-600`) en botones principales y encabezados del chat.
* **Acento / Hover:** Bronce profundo (`#92400E` / `#78350F`).
* **Texto principal:** Carbón cálido (`#1C1917` / `stone-900`) para máxima legibilidad sobre fondo claro.
* **Texto secundario:** Gris cálido (`#57534E` / `stone-600`).
* **Logo corporativo (`TokenServiceLogo.tsx`):** Crear un componente SVG propio y elegante inspirado en una brújula dorada facetada de 4 puntas principales con anillos geométricos abiertos y una letra **"T"** blanca nítida en el centro circular ámbar. No usar imágenes externas rotas.

---

## 4. Estructura de Carpetas del Monorepo

```text
tokenservice/
├── docs/prompts/          # Archivos de especificación (no modificar)
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/        # prisma.ts, env.ts
│   │   ├── middlewares/   # auth.middleware.ts
│   │   ├── routes/        # auth, conocimiento, restricciones, chat, solicitudes, historial
│   │   ├── services/      # gemini.service.ts, parser.service.ts
│   │   └── index.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── client/
    ├── src/
    │   ├── components/    # Navbar, Footer, TokenServiceLogo, ChatWidget, ProtectedRoute
    │   ├── context/       # AuthContext.tsx
    │   ├── pages/
    │   │   ├── public/    # Home, Servicios, Planes, Soporte, Cotizar
    │   │   └── admin/     # AdminLogin, AdminLayout, AdminConocimiento, AdminRestricciones, AdminHistorial, AdminSolicitudes
    │   ├── services/      # api.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

---

## 5. Mapa de Rutas de la Aplicación

* **Rutas Públicas (válidas para que el bot sugiera navegación):**
  * `/` — Inicio
  * `/servicios` — Catálogo de servicios TI
  * `/planes` — Planes de mantenimiento y SLA
  * `/soporte` — Formulario de tickets + botón directo a WhatsApp con mensaje predefinido
  * `/cotizar` — Formulario de solicitud de cotización
* **Rutas Privadas (el bot JAMÁS debe mencionarlas ni sugerirlas):**
  * `/admin/login`
  * `/admin/conocimiento`
  * `/admin/restricciones`
  * `/admin/historial`
  * `/admin/solicitudes`

---

## 6. Reglas de Código para el Agente

1. **TypeScript estricto:** Evitar `any` innecesario; definir interfaces compartidas claras para los payloads y respuestas de la API.
2. **Idioma:** Toda la interfaz de usuario, mensajes de error amigables, datos del `seed.ts` y comentarios clave deben estar en **español**.
3. **Sin llaves hardcodeadas:** `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY` y `VITE_WHATSAPP_NUMBER` deben leerse siempre de `.env`.
4. **Calidad visual:** Todos los estados de carga (spinners/skeletons), estados vacíos y notificaciones de éxito/error deben estar estilizados con Tailwind CSS siguiendo el tema claro dorado.