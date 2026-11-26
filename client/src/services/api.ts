export const TOKEN_STORAGE_KEY = 'tokenservice_admin_token';
export const CONV_STORAGE_KEY = 'tokenservice_conv_id';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:4000/api';

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export type RutaPublica =
  | '/'
  | '/servicios'
  | '/planes'
  | '/soporte'
  | '/cotizar';

export interface MensajeChat {
  id?: number;
  rol: 'user' | 'model';
  texto: string;
  rutaSugerida: RutaPublica | null;
  textoBoton?: string | null;
  creadoEn?: string;
}

export interface RespuestaChatApi {
  conversacionId: string;
  respuesta: string;
  rutaSugerida: RutaPublica | null;
  textoBoton: string | null;
}

export interface HistorialChatPublico {
  conversacionId: string;
  creadaEn: string;
  mensajes: Array<{
    id: number;
    rol: 'user' | 'model';
    texto: string;
    rutaSugerida: RutaPublica | null;
    creadoEn: string;
  }>;
}

export type TipoSolicitud = 'SOPORTE' | 'COTIZACION';
export type EstadoSolicitud = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';

export interface CrearSolicitudPayload {
  tipo: TipoSolicitud;
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  asunto: string;
  mensaje: string;
}

export interface SolicitudContacto {
  id: number;
  tipo: TipoSolicitud;
  nombre: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  asunto: string;
  mensaje: string;
  estado: EstadoSolicitud;
  creadoEn: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
}

export interface ConocimientoItem {
  id: number;
  titulo: string;
  categoria: string;
  contenido: string;
  urlGuia: RutaPublica | null;
  fuente: 'manual' | 'pdf' | 'txt' | string;
  esPublico: boolean;
  creadoEn: string;
  actualizado: string;
}

export interface ReglaRestriccionItem {
  id: number;
  descripcion: string;
  activa: boolean;
  creadoEn: string;
}

export interface ResumenConversacion {
  id: string;
  creadaEn: string;
  totalMensajes: number;
  primerMensaje: string | null;
}

export interface DetalleConversacion {
  id: string;
  creadaEn: string;
  mensajes: Array<{
    id: number;
    rol: 'user' | 'model';
    texto: string;
    rutaSugerida: RutaPublica | null;
    creadoEn: string;
  }>;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor de TokenService. Verifica tu conexión e inténtalo nuevamente.'
    );
  }

  let data: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const serverMessage =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Error HTTP ${response.status} al comunicarse con el servidor.`;

    throw new ApiError(response.status, serverMessage);
  }

  return data as T;
}

// === Endpoints Públicos ===

export function enviarMensajeChat(
  mensaje: string,
  conversacionId?: string | null
): Promise<RespuestaChatApi> {
  return apiFetch<RespuestaChatApi>('/chat', {
    method: 'POST',
    body: JSON.stringify({
      mensaje,
      ...(conversacionId ? { conversacionId } : {}),
    }),
  });
}

export function obtenerHistorialChatPublico(
  conversacionId: string
): Promise<HistorialChatPublico> {
  return apiFetch<HistorialChatPublico>(`/chat/${encodeURIComponent(conversacionId)}`);
}

export function crearSolicitudPublica(
  payload: CrearSolicitudPayload
): Promise<SolicitudContacto> {
  return apiFetch<SolicitudContacto>('/solicitudes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// === Endpoints Administrativos (JWT) ===

export interface LoginResponse {
  token: string;
  admin: UsuarioAdmin;
}

export function loginAdmin(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function obtenerAdminActual(): Promise<{ admin: UsuarioAdmin }> {
  return apiFetch<{ admin: UsuarioAdmin }>('/auth/me');
}

export interface CrearConocimientoPayload {
  titulo: string;
  categoria: string;
  contenido: string;
  urlGuia: RutaPublica | null;
  esPublico: boolean;
}

export type ActualizarConocimientoPayload = Partial<CrearConocimientoPayload>;

export interface UploadConocimientoResponse {
  registro: ConocimientoItem;
  caracteresExtraidos: number;
}

export function listarConocimiento(params?: {
  categoria?: string;
  q?: string;
  esPublico?: 'true' | 'false' | '';
}): Promise<ConocimientoItem[]> {
  const qs = new URLSearchParams();
  if (params?.categoria && params.categoria !== 'Todas') {
    qs.set('categoria', params.categoria);
  }
  if (params?.q?.trim()) {
    qs.set('q', params.q.trim());
  }
  if (params?.esPublico === 'true' || params?.esPublico === 'false') {
    qs.set('esPublico', params.esPublico);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<ConocimientoItem[]>(`/conocimiento${suffix}`);
}

export function crearConocimientoManual(
  payload: CrearConocimientoPayload
): Promise<ConocimientoItem> {
  return apiFetch<ConocimientoItem>('/conocimiento', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function subirDocumentoConocimiento(
  formData: FormData
): Promise<UploadConocimientoResponse> {
  return apiFetch<UploadConocimientoResponse>('/conocimiento/upload', {
    method: 'POST',
    body: formData,
  });
}

export function actualizarConocimiento(
  id: number,
  payload: ActualizarConocimientoPayload
): Promise<ConocimientoItem> {
  return apiFetch<ConocimientoItem>(`/conocimiento/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function eliminarConocimiento(
  id: number
): Promise<{ ok: boolean; mensaje: string }> {
  return apiFetch<{ ok: boolean; mensaje: string }>(`/conocimiento/${id}`, {
    method: 'DELETE',
  });
}

export function listarRestricciones(): Promise<ReglaRestriccionItem[]> {
  return apiFetch<ReglaRestriccionItem[]>('/restricciones');
}

export function crearRestriccion(
  descripcion: string,
  activa = true
): Promise<ReglaRestriccionItem> {
  return apiFetch<ReglaRestriccionItem>('/restricciones', {
    method: 'POST',
    body: JSON.stringify({ descripcion, activa }),
  });
}

export function actualizarRestriccion(
  id: number,
  payload: { descripcion?: string; activa?: boolean }
): Promise<ReglaRestriccionItem> {
  return apiFetch<ReglaRestriccionItem>(`/restricciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function eliminarRestriccion(
  id: number
): Promise<{ ok: boolean; mensaje: string }> {
  return apiFetch<{ ok: boolean; mensaje: string }>(`/restricciones/${id}`, {
    method: 'DELETE',
  });
}

export function listarHistorial(): Promise<ResumenConversacion[]> {
  return apiFetch<ResumenConversacion[]>('/historial');
}

export function obtenerDetalleConversacion(
  id: string
): Promise<DetalleConversacion> {
  return apiFetch<DetalleConversacion>(`/historial/${encodeURIComponent(id)}`);
}

export function listarSolicitudes(params?: {
  tipo?: TipoSolicitud | '';
  estado?: EstadoSolicitud | '';
}): Promise<SolicitudContacto[]> {
  const qs = new URLSearchParams();
  if (params?.tipo) qs.set('tipo', params.tipo);
  if (params?.estado) qs.set('estado', params.estado);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<SolicitudContacto[]>(`/solicitudes${suffix}`);
}

export function actualizarEstadoSolicitud(
  id: number,
  estado: EstadoSolicitud
): Promise<SolicitudContacto> {
  return apiFetch<SolicitudContacto>(`/solicitudes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
