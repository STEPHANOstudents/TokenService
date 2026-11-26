# 04 — Frontend: Web Corporativa TokenService y Widget de Chat IA

Lee `docs/prompts/00-arquitectura-y-reglas.md` como referencia. Respeta rigurosamente el **tema claro (marfil/blanco)** y los **acentos dorados/ámbar y bronce**. Ejecuta únicamente esta fase y detente al completar la verificación.

---

## 1. Cliente API y Componentes Base (`client/src/`)

1. **`src/services/api.ts`**: Helper centralizado usando `import.meta.env.VITE_API_URL` que adjunte automáticamente el token JWT desde `localStorage` cuando exista y maneje errores JSON.
2. **`src/components/TokenServiceLogo.tsx`**:
   * Logo SVG corporativo original inspirado en una brújula dorada metálica de 4 puntas con anillos geométricos abiertos, un núcleo circular ámbar/dorado brillante y una letra **"T"** blanca nítida en el centro.
   * Acompañado del nombre **TokenService** en tipografía limpia con "Token" en carbón oscuro y "Service" en ámbar dorado (`text-amber-600`).
3. **`src/components/Navbar.tsx`**:
   * Fondo blanco translúcido con borde inferior dorado suave (`border-amber-200/70`).
   * Enlaces: Inicio (`/`), Servicios (`/servicios`), Planes (`/planes`), Soporte (`/soporte`), y botón destacado dorado **"Cotizar"** (`/cotizar`).
   * Enlace discreto en el extremo o en el footer para **"Acceso Admin"** (`/admin/login`) —sin destacarlo para visitantes comunes, pero accesible para la demo—.
   * Menú móvil responsivo.
4. **`src/components/Footer.tsx`**:
   * Fondo arena muy claro (`#F7F1E3`), información de contacto ficticia en Lima, Perú, enlaces rápidos y enlace discreto al panel administrativo.

---

## 2. Páginas Públicas (`client/src/pages/public/`)

1. **`Home.tsx` (`/`):**
   * Hero luminoso con degradado crema/dorado muy sutil, propuesta de valor de TokenService ("Infraestructura TI segura, soporte ágil y orientación inteligente 24/7"), botones a `/servicios` y `/planes`, y una tarjeta interactiva invitando a probar el asistente virtual en la esquina inferior derecha.
   * Sección de 4 pilares (Redes, Servidores, Soporte TI, Ciberseguridad) con tarjetas blancas, bordes dorados suaves y sombras cálidas.
2. **`Servicios.tsx` (`/servicios`):**
   * Catálogo claro de los 4 servicios principales con beneficios concretos y botón para cotizar o preguntar al asistente.
3. **`Planes.tsx` (`/planes`):**
   * Comparativa de los 3 planes (**Básico S/ 650/mes**, **Pyme S/ 1,450/mes** destacado con borde dorado, **Corporativo A medida**) coincidiendo exactamente con los datos del `seed.ts`.
4. **`Soporte.tsx` (`/soporte`):**
   * **Formulario de apertura de ticket** (Nombre, Email, Teléfono, Empresa, Asunto, Descripción) conectado a `POST /api/solicitudes` con `tipo: "SOPORTE"`, mostrando confirmación visual al guardar en PostgreSQL.
   * **Tarjeta de Contacto Directo por WhatsApp:** Botón prominente verde/dorado que abre `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=...` en nueva pestaña con un **mensaje predefinido**. Si el usuario ya escribió su nombre o asunto en el formulario, el mensaje de WhatsApp se prellena dinámicamente con esos datos (ej.: *"Hola equipo de TokenService, soy [Nombre]. Necesito soporte técnico sobre: [Asunto]."*); si están vacíos, usa un mensaje estándar amigable.
5. **`Cotizar.tsx` (`/cotizar`):**
   * Formulario de cotización (Nombre, Email, Teléfono, Empresa, Servicio/Plan de interés, Detalles del requerimiento) conectado a `POST /api/solicitudes` con `tipo: "COTIZACION"`.

---

## 3. Widget de Chat Flotante Anónimo (`src/components/ChatWidget.tsx`)

Debe estar montado globalmente en todas las rutas públicas (oculto dentro de `/admin/*`):

1. **Sin login:** Al cargar, lee `tokenservice_conv_id` de `localStorage`. Si existe, llama a `GET /api/chat/:id` para restaurar la conversación previa del visitante.
2. **Diseño:**
   * Botón flotante circular dorado en la esquina inferior derecha con ícono de mensaje y pequeño indicador de estado en línea.
   * Ventana de chat en tema claro (encabezado con gradiente ámbar-dorado, cuerpo blanco/marfil, burbujas del usuario en ámbar suave/dorado y del bot en blanco con borde arena).
   * Botón en el encabezado para **"Nueva conversación"** (limpia `localStorage` y reinicia el estado).
3. **Chips de preguntas rápidas** (cuando el chat está vacío):
   * *"¿Qué planes de mantenimiento tienen?"*
   * *"Necesito soporte técnico urgente"*
   * *"¿Qué servicios de redes ofrecen?"*
4. **Botones interactivos de navegación:**
   * Cuando Gemini devuelve `rutaSugerida` y `textoBoton`, renderizar debajo del mensaje del bot un botón estilizado con flecha (ej. `Ver planes →`).
   * Al hacer clic, usar `useNavigate()` de React Router para llevar al usuario a esa página **sin recargar la web ni perder el historial del chat**.
5. **Estados de carga y error:** Indicador animado de *"TokenService IA está escribiendo..."* y manejo elegante si ocurre un error `429` o de red.

---

## Verificación antes de terminar la Fase 4

1. Ejecuta `npm run build` en `client/` para confirmar cero errores de TypeScript/Tailwind.
2. Levanta ambos servidores y comprueba que:
   * Se puede navegar por las 5 páginas públicas con el tema claro dorado.
   * El chat responde sin iniciar sesión y los botones sugeridos por Gemini navegan correctamente.
   * El botón de WhatsApp en `/soporte` genera la URL con el mensaje predefinido y los formularios guardan en PostgreSQL.
3. Muéstrame un resumen breve y espera mi confirmación para pasar a la Fase 5.