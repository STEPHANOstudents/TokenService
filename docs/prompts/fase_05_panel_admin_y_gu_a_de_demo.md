# 05 — Frontend: Panel de Administración Completo y Guion de Sustentación

Lee `docs/prompts/00-arquitectura-y-reglas.md` como referencia. Esta es la fase final del proyecto.

---

## 1. Contexto de Autenticación y Rutas Protegidas

1. **`client/src/context/AuthContext.tsx`**:
   * Maneja `admin`, `token`, `login(email, password)`, `logout()` y verificación inicial con `GET /api/auth/me`.
   * Guarda el token en `localStorage` bajo la clave `tokenservice_admin_token`.
2. **`client/src/components/ProtectedRoute.tsx`**:
   * Redirige a `/admin/login` si no hay sesión válida.

---

## 2. Pantallas del Panel Administrativo (`client/src/pages/admin/`)

Mantener la misma estética **clara con acentos dorados y bronce** de TokenService:

1. **`AdminLogin.tsx` (`/admin/login`):**
   * Formulario limpio y centrado con el `TokenServiceLogo`, campos de correo y contraseña, y botón de retorno a la web pública (`/`).
2. **`AdminLayout.tsx`:**
   * Barra lateral izquierda con navegación clara a:
     * **Base de Conocimiento** (`/admin/conocimiento`)
     * **Restricciones IA** (`/admin/restricciones`)
     * **Historial de Chats** (`/admin/historial`)
     * **Tickets y Cotizaciones** (`/admin/solicitudes`)
   * Enlace rápido **"Ver Web Pública"** (abre `/` en nueva pestaña para probar cambios en vivo) y botón **"Cerrar Sesión"**.
3. **`AdminConocimiento.tsx` (`/admin/conocimiento`):**
   * **Tarjetas resumen arriba:** Total de artículos, Públicos (visibles para la IA) y Confidenciales (bloqueados para la IA).
   * **Dos formas de alimentar al bot:**
     1. **Botón "Nuevo Artículo Manual":** Modal/formulario con Título, Categoría, Contenido, Ruta de navegación sugerida (select con las 5 rutas públicas o "Ninguna") y switch **Público / Confidencial**.
     2. **Botón "Subir Documento (.pdf / .txt)":** Modal con selector de archivo `.pdf`/`.txt`, Título, Categoría, Ruta opcional y switch **Público / Confidencial**, conectado a `POST /api/conocimiento/upload`. Muestra una alerta de éxito con el número de caracteres extraídos.
   * **Tabla/Lista de conocimientos:**
     * Muestra insignia visual verde/dorada (**Público — IA lo usa**) o roja/oscura (**Confidencial — Bloqueado**), junto con una insignia de fuente (`manual`, `pdf`, `txt`).
     * Interruptor rápido en cada fila para cambiar `esPublico` en un clic (`PUT /api/conocimiento/:id`).
     * Botones de editar y eliminar con confirmación.
4. **`AdminRestricciones.tsx` (`/admin/restricciones`):**
   * Formulario rápido en la parte superior para añadir una nueva regla en texto plano (ej. *"No mencionar precios numéricos; derivar siempre a /cotizar"*).
   * Lista de reglas con switch para activar/desactivar al instante y botón de eliminar.
5. **`AdminHistorial.tsx` (`/admin/historial`):**
   * Vista dividida (maestro-detalle): a la izquierda la lista de conversaciones con fecha y cantidad de mensajes; a la derecha el hilo completo de preguntas del visitante y respuestas del bot (mostrando qué ruta sugirió la IA).
6. **`AdminSolicitudes.tsx` (`/admin/solicitudes`):**
   * Tabla con filtros (`Todos`, `SOPORTE`, `COTIZACION`) mostrando los tickets y cotizaciones enviados desde la web pública, con selector para cambiar su estado (`PENDIENTE`, `EN_PROCESO`, `RESUELTO`).

---

## 3. Documento de Demo para Sustentación (`DEMO-SUSTENTACION.md`)

Crea en la raíz del proyecto (`tokenservice/DEMO-SUSTENTACION.md`) una guía breve de 1 página con:
* Comandos exactos para levantar backend y frontend.
* Credenciales del administrador (`admin@tokenservice.com` / `Admin123!`).
* Guion paso a paso de **5 pruebas en vivo** para mostrarle al docente:
  1. Navegación asistida por el bot con botones interactivos (sin login).
  2. Intento de fuga de datos confidenciales (`esPublico: false`) y prueba de *prompt injection*.
  3. Subida en vivo de un archivo `.txt` o `.pdf` en `/admin/conocimiento` y consulta inmediata en el chat.
  4. Activación de una nueva restricción en `/admin/restricciones` y cambio inmediato de comportamiento del bot.
  5. Envío de ticket en `/soporte` + botón de WhatsApp predefinido + visualización del ticket y del historial en `/admin`.

---

## Verificación Final

1. Ejecuta `npm run build` tanto en `server/` como en `client/` para garantizar cero errores de compilación.
2. Verifica que el flujo completo (web pública, chat anónimo, login admin, subida `.txt`/`.pdf`, cambio de reglas y auditoría) funcione de extremo a extremo.
3. Presenta el resumen final del proyecto terminado.