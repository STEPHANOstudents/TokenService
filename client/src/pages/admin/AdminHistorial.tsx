import { useCallback, useEffect, useState } from 'react';
import {
  MessageSquareText,
  RefreshCw,
  Loader2,
  AlertCircle,
  Navigation,
  Clock,
  User,
  Bot,
} from 'lucide-react';
import {
  ApiError,
  listarHistorial,
  obtenerDetalleConversacion,
} from '../../services/api';
import type {
  DetalleConversacion,
  ResumenConversacion,
} from '../../services/api';

function formatearFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminHistorial() {
  const [conversaciones, setConversaciones] = useState<ResumenConversacion[]>(
    []
  );
  const [cargandoLista, setCargandoLista] = useState(true);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleConversacion | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDetalle = useCallback(async (id: string) => {
    setSeleccionadaId(id);
    setCargandoDetalle(true);
    setError(null);
    try {
      const data = await obtenerDetalleConversacion(id);
      setDetalle(data);
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el detalle de la conversación.'
      );
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    setError(null);
    try {
      const data = await listarHistorial();
      setConversaciones(data);
      if (data.length > 0) {
        void cargarDetalle(data[0].id);
      } else {
        setSeleccionadaId(null);
        setDetalle(null);
      }
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el historial de conversaciones.'
      );
    } finally {
      setCargandoLista(false);
    }
  }, [cargarDetalle]);

  useEffect(() => {
    void cargarLista();
  }, [cargarLista]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Auditoría de Conversaciones IA
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Revisa las últimas 30 sesiones anónimas del chatbot, las respuestas
            emitidas y las rutas públicas sugeridas por Gemini.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void cargarLista()}
          disabled={cargandoLista}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-bronze bg-sand hover:bg-amber-100 border border-goldBorder transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw
            className={`w-4 h-4 text-amber-600 ${cargandoLista ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vista maestro-detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna izquierda: lista de conversaciones */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-goldBorder shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-sand/70 border-b border-goldBorder text-xs font-bold uppercase tracking-wider text-brand-bronze">
            Conversaciones recientes ({conversaciones.length})
          </div>

          {cargandoLista ? (
            <div className="p-10 flex flex-col items-center gap-2 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <p className="text-xs">Cargando sesiones...</p>
            </div>
          ) : conversaciones.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <MessageSquareText className="w-9 h-9 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">
                Aún no hay conversaciones
              </p>
              <p className="text-xs text-stone-500">
                Cuando un visitante use el chat público aparecerá aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-goldBorder/70 max-h-[620px] overflow-y-auto">
              {conversaciones.map((conv) => {
                const activa = conv.id === seleccionadaId;
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => void cargarDetalle(conv.id)}
                      className={`w-full text-left p-4 transition-colors space-y-1.5 ${
                        activa
                          ? 'bg-amber-50/90 border-l-4 border-l-amber-500'
                          : 'hover:bg-ivory'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {formatearFecha(conv.creadaEn)}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sand text-brand-bronze border border-goldBorder">
                          {conv.totalMensajes} msgs
                        </span>
                      </div>
                      <p className="text-sm font-medium text-stone-800 line-clamp-2">
                        {conv.primerMensaje || 'Sesión sin mensajes registrados'}
                      </p>
                      <p className="text-[10px] font-mono text-stone-400 truncate">
                        ID: {conv.id}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Columna derecha: hilo completo */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-goldBorder shadow-sm overflow-hidden min-h-[420px] flex flex-col">
          <div className="px-6 py-4 bg-sand/70 border-b border-goldBorder flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Hilo de Conversación
              </h2>
              {detalle && (
                <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                  Sesión {detalle.id} · Iniciada {formatearFecha(detalle.creadaEn)}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 max-h-[620px] overflow-y-auto bg-ivory/60">
            {cargandoDetalle ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-stone-500">
                <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
                <p className="text-xs">Cargando mensajes...</p>
              </div>
            ) : !detalle ? (
              <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-sm">
                Selecciona una conversación a la izquierda para auditarla.
              </div>
            ) : detalle.mensajes.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-stone-500 text-sm">
                Esta conversación no contiene mensajes.
              </div>
            ) : (
              detalle.mensajes.map((msg) => {
                const esUsuario = msg.rol === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      esUsuario ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1 px-1">
                      {esUsuario ? (
                        <>
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold">Visitante</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-brand-bronze" />
                          <span className="font-semibold">TokenService IA</span>
                        </>
                      )}
                      <span>· {formatearFecha(msg.creadoEn)}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        esUsuario
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-tr-sm'
                          : 'bg-white border border-goldBorder text-stone-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.texto}
                    </div>

                    {!esUsuario && msg.rutaSugerida && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-brand-bronze">
                        <Navigation className="w-3.5 h-3.5 text-amber-600" />
                        Ruta sugerida por IA:{' '}
                        <code className="font-mono text-amber-800">
                          {msg.rutaSugerida}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
