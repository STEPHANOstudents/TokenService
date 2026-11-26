import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  ApiError,
  CONV_STORAGE_KEY,
  enviarMensajeChat,
  obtenerHistorialChatPublico,
} from '../services/api';
import type { MensajeChat, RutaPublica } from '../services/api';

const PREGUNTAS_RAPIDAS = [
  '¿Qué planes de mantenimiento tienen?',
  'Necesito soporte técnico urgente',
  '¿Qué servicios de redes ofrecen?',
] as const;

const ETIQUETA_RUTA_DEFECTO: Record<RutaPublica, string> = {
  '/': 'Ir al inicio',
  '/servicios': 'Ver servicios',
  '/planes': 'Ver planes',
  '/soporte': 'Abrir ticket de soporte',
  '/cotizar': 'Solicitar cotización',
};

const MAX_CARACTERES = 1000;

export function ChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [conversacionId, setConversacionId] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState('');
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finMensajesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const conversacionIdRef = useRef<string | null>(null);
  const enviandoRef = useRef(false);

  conversacionIdRef.current = conversacionId;
  enviandoRef.current = enviando;

  const esRutaAdmin = location.pathname.startsWith('/admin');

  // Restaurar conversación anónima previa desde localStorage
  useEffect(() => {
    if (esRutaAdmin) return;

    let idGuardado: string | null = null;
    try {
      idGuardado = localStorage.getItem(CONV_STORAGE_KEY);
    } catch {
      idGuardado = null;
    }

    if (!idGuardado) return;

    let cancelado = false;
    setCargandoHistorial(true);

    obtenerHistorialChatPublico(idGuardado)
      .then((data) => {
        if (cancelado) return;
        setConversacionId(data.conversacionId);
        setMensajes(
          data.mensajes.map((m) => ({
            id: m.id,
            rol: m.rol,
            texto: m.texto,
            rutaSugerida: m.rutaSugerida,
            textoBoton: m.rutaSugerida
              ? ETIQUETA_RUTA_DEFECTO[m.rutaSugerida]
              : null,
            creadoEn: m.creadoEn,
          }))
        );
      })
      .catch(() => {
        if (cancelado) return;
        // Si la conversación ya no existe en BD, limpiar localStorage silenciosamente
        try {
          localStorage.removeItem(CONV_STORAGE_KEY);
        } catch {
          // ignorar
        }
        setConversacionId(null);
      })
      .finally(() => {
        if (!cancelado) setCargandoHistorial(false);
      });

    return () => {
      cancelado = true;
    };
  }, [esRutaAdmin]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (abierto) {
      finMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, enviando, abierto]);

  // Foco en input al abrir
  useEffect(() => {
    if (abierto) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [abierto]);

  const enviarConsulta = useCallback(async (textoOriginal: string) => {
    const texto = textoOriginal.trim();
    if (!texto || enviandoRef.current) return;

    if (texto.length > MAX_CARACTERES) {
      setError(`Tu mensaje no puede superar los ${MAX_CARACTERES} caracteres.`);
      return;
    }

    setError(null);
    setInput('');

    const mensajeUsuarioTemp: MensajeChat = {
      rol: 'user',
      texto,
      rutaSugerida: null,
      textoBoton: null,
      creadoEn: new Date().toISOString(),
    };

    setMensajes((prev) => [...prev, mensajeUsuarioTemp]);
    setEnviando(true);

    try {
      const data = await enviarMensajeChat(texto, conversacionIdRef.current);

      setConversacionId(data.conversacionId);
      try {
        localStorage.setItem(CONV_STORAGE_KEY, data.conversacionId);
      } catch {
        // ignorar si localStorage no está disponible
      }

      const mensajeBot: MensajeChat = {
        rol: 'model',
        texto: data.respuesta,
        rutaSugerida: data.rutaSugerida,
        textoBoton:
          data.textoBoton ||
          (data.rutaSugerida ? ETIQUETA_RUTA_DEFECTO[data.rutaSugerida] : null),
        creadoEn: new Date().toISOString(),
      };

      setMensajes((prev) => [...prev, mensajeBot]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError(
            err.message ||
              'El asistente está recibiendo muchas consultas en este momento. Intenta nuevamente en unos segundos.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError(
          'No se pudo contactar al asistente virtual. Revisa tu conexión e inténtalo de nuevo.'
        );
      }
    } finally {
      setEnviando(false);
    }
  }, []);

  // Permitir abrir el chat desde botones en Home o Servicios
  useEffect(() => {
    if (esRutaAdmin) return;

    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ pregunta?: string }>;
      setAbierto(true);
      const pregunta = customEvent.detail?.pregunta;
      if (typeof pregunta === 'string' && pregunta.trim()) {
        void enviarConsulta(pregunta);
      }
    };

    window.addEventListener('tokenservice:open-chat', handleOpenChat);
    return () => {
      window.removeEventListener('tokenservice:open-chat', handleOpenChat);
    };
  }, [esRutaAdmin, enviarConsulta]);

  if (esRutaAdmin) {
    return null;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void enviarConsulta(input);
  };

  const handleNuevaConversacion = (): void => {
    try {
      localStorage.removeItem(CONV_STORAGE_KEY);
    } catch {
      // ignorar
    }
    setConversacionId(null);
    setMensajes([]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  const handleNavegarSugerida = (ruta: RutaPublica): void => {
    navigate(ruta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Ventana de chat abierta */}
      {abierto && (
        <section
          aria-label="Asistente virtual de TokenService"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] h-[540px] max-h-[calc(100vh-7rem)] bg-ivory rounded-3xl border border-goldBorder shadow-2xl shadow-amber-950/15 flex flex-col overflow-hidden"
        >
          {/* Encabezado con gradiente ámbar-dorado */}
          <header className="px-4 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/95 border border-amber-200 flex items-center justify-center shrink-0 p-1 shadow-sm">
                <img
                  src="/tokenIconIA.png"
                  alt="TokenService IA"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-tight truncate">
                  Asistente TokenService
                </h2>
                <p className="text-[11px] text-amber-50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  En línea · Soporte e información
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleNuevaConversacion}
                title="Nueva conversación"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva</span>
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar asistente"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Cuerpo de mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-ivory">
            {cargandoHistorial ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <p className="text-xs">Restaurando conversación...</p>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-white border border-goldBorder rounded-2xl rounded-tl-sm p-4 shadow-sm">
                  <p className="text-sm font-semibold text-stone-900">
                    ¡Hola! Soy el asistente virtual de TokenService.
                  </p>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Puedo informarte sobre nuestros servicios de redes,
                    servidores, ciberseguridad, planes de mantenimiento y cómo
                    solicitar soporte o cotizaciones.
                  </p>
                </div>

                {/* Chips de preguntas rápidas */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 px-1">
                    Preguntas rápidas
                  </p>
                  <div className="flex flex-col gap-2">
                    {PREGUNTAS_RAPIDAS.map((pregunta) => (
                      <button
                        key={pregunta}
                        type="button"
                        onClick={() => void enviarConsulta(pregunta)}
                        disabled={enviando}
                        className="text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-sand border border-goldBorder text-xs font-medium text-brand-bronze shadow-sm transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                      >
                        <span>{pregunta}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              mensajes.map((msg, idx) => {
                const esUsuario = msg.rol === 'user';
                return (
                  <div
                    key={msg.id ?? `${msg.rol}-${idx}`}
                    className={`flex flex-col ${
                      esUsuario ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        esUsuario
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-sm'
                          : 'bg-white border border-goldBorder text-stone-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.texto}
                    </div>

                    {/* Botón interactivo de navegación sugerida por Gemini */}
                    {!esUsuario && msg.rutaSugerida && (
                      <button
                        type="button"
                        onClick={() => handleNavegarSugerida(msg.rutaSugerida!)}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-bronze bg-sand hover:bg-amber-100 border border-amber-300/90 shadow-sm transition-colors"
                      >
                        <span>
                          {msg.textoBoton ||
                            ETIQUETA_RUTA_DEFECTO[msg.rutaSugerida]}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Indicador animado de escritura */}
            {enviando && (
              <div className="flex items-start">
                <div className="bg-white border border-goldBorder rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm inline-flex items-center gap-2">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.25s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.12s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    TokenService IA está escribiendo...
                  </span>
                </div>
              </div>
            )}

            {/* Banner elegante de error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  aria-label="Ocultar error"
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div ref={finMensajesRef} />
          </div>

          {/* Barra de entrada */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-goldBorder shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_CARACTERES}
                disabled={enviando}
                placeholder="Escribe tu consulta sobre TokenService..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={enviando || !input.trim()}
                aria-label="Enviar mensaje"
                className="p-2.5 rounded-xl text-white bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 shadow-sm transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-stone-400 text-center">
              Respuestas basadas únicamente en información oficial pública de TokenService.
            </p>
          </form>
        </section>
      )}

      {/* Botón flotante circular dorado */}
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-label={abierto ? 'Minimizar asistente virtual' : 'Abrir asistente virtual'}
        className="relative w-14 h-14 rounded-full bg-white hover:bg-ivory border-2 border-amber-400 text-amber-700 shadow-xl shadow-amber-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50"
      >
        {abierto ? (
          <X className="w-6 h-6 text-brand-bronze" />
        ) : (
          <img
            src="/tokenIconIA.png"
            alt="Abrir Asistente TokenService"
            className="w-11 h-11 object-contain drop-shadow-sm"
          />
        )}
        {/* Indicador de estado en línea */}
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm"
        />
      </button>
    </div>
  );
}
