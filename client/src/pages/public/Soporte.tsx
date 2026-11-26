import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Headphones,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Send,
  ExternalLink,
} from 'lucide-react';
import { ApiError, crearSolicitudPublica } from '../../services/api';
import type { SolicitudContacto } from '../../services/api';

const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(
    /\D/g,
    ''
  ) || '51999999999';

interface SoporteFormState {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  asunto: string;
  mensaje: string;
}

const ESTADO_INICIAL: SoporteFormState = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  asunto: '',
  mensaje: '',
};

export function Soporte() {
  const [form, setForm] = useState<SoporteFormState>(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketCreado, setTicketCreado] = useState<SolicitudContacto | null>(
    null
  );

  // Mensaje predefinido dinámico para WhatsApp según lo que el usuario haya escrito
  const mensajeWhatsApp = useMemo(() => {
    const nombreLimpio = form.nombre.trim();
    const asuntoLimpio = form.asunto.trim();
    const empresaLimpia = form.empresa.trim();

    if (nombreLimpio && asuntoLimpio) {
      const sufijoEmpresa = empresaLimpia ? ` de ${empresaLimpia}` : '';
      return `Hola equipo de TokenService, soy ${nombreLimpio}${sufijoEmpresa}. Necesito soporte técnico sobre: ${asuntoLimpio}.`;
    }
    if (nombreLimpio) {
      const sufijoEmpresa = empresaLimpia ? ` de ${empresaLimpia}` : '';
      return `Hola equipo de TokenService, soy ${nombreLimpio}${sufijoEmpresa}. Necesito asistencia con soporte técnico TI.`;
    }
    if (asuntoLimpio) {
      return `Hola equipo de TokenService, necesito soporte técnico sobre: ${asuntoLimpio}.`;
    }
    return 'Hola equipo de TokenService, necesito asistencia con soporte técnico TI para mi empresa.';
  }, [form.nombre, form.asunto, form.empresa]);

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
  }, [mensajeWhatsApp]);

  const handleChange = (
    field: keyof SoporteFormState,
    value: string
  ): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (
      !form.nombre.trim() ||
      !form.email.trim() ||
      !form.asunto.trim() ||
      !form.mensaje.trim()
    ) {
      setError('Por favor completa todos los campos obligatorios marcados con *.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await crearSolicitudPublica({
        tipo: 'SOPORTE',
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        empresa: form.empresa.trim() || undefined,
        asunto: form.asunto.trim(),
        mensaje: form.mensaje.trim(),
      });
      setTicketCreado(resultado);
      setForm(ESTADO_INICIAL);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al registrar tu ticket. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-ivory">
      {/* Encabezado */}
      <section className="border-b border-goldBorder/70 bg-gradient-to-b from-amber-50/70 to-ivory py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Centro de Soporte Técnico
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Abre un ticket o contáctanos directo por WhatsApp
            </h1>
            <p className="mt-3 text-stone-600 text-base">
              Registra tu incidencia técnica para asignarle seguimiento inmediato
              de acuerdo con tu SLA, o escríbenos por WhatsApp para atención
              rápida.
            </p>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario de Ticket */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-goldBorder shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 border-b border-goldBorder/70">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Abrir Ticket de Soporte TI
                </h2>
                <p className="text-xs text-stone-500">
                  Tu solicitud se registrará directamente en nuestra mesa de ayuda.
                </p>
              </div>
            </div>

            {ticketCreado ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-900">
                      ¡Ticket #{ticketCreado.id} registrado correctamente!
                    </h3>
                    <p className="text-sm text-emerald-800 mt-1">
                      Hemos recibido tu reporte sobre{' '}
                      <strong>{ticketCreado.asunto}</strong>. Un especialista de
                      TokenService se comunicará al correo{' '}
                      <strong>{ticketCreado.email}</strong> a la brevedad.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketCreado(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100/60 transition-colors"
                >
                  Registrar otro ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="soporte-nombre"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Nombre completo <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="soporte-nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="soporte-email"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Correo corporativo <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="soporte-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="carlos@empresa.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="soporte-telefono"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Teléfono / Celular
                    </label>
                    <input
                      id="soporte-telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="Ej. 999 888 777"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="soporte-empresa"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Empresa
                    </label>
                    <input
                      id="soporte-empresa"
                      type="text"
                      value={form.empresa}
                      onChange={(e) => handleChange('empresa', e.target.value)}
                      placeholder="Nombre de tu organización"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="soporte-asunto"
                    className="block text-sm font-medium text-stone-800 mb-1.5"
                  >
                    Asunto de la incidencia <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="soporte-asunto"
                    type="text"
                    required
                    value={form.asunto}
                    onChange={(e) => handleChange('asunto', e.target.value)}
                    placeholder="Ej. Caída de enlace VPN / Error en servidor de archivos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="soporte-mensaje"
                    className="block text-sm font-medium text-stone-800 mb-1.5"
                  >
                    Descripción detallada <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    id="soporte-mensaje"
                    rows={4}
                    required
                    value={form.mensaje}
                    onChange={(e) => handleChange('mensaje', e.target.value)}
                    placeholder="Cuéntanos qué ocurrió, cuántos usuarios están afectados y desde qué hora se presenta el problema..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 shadow-md shadow-amber-500/20 transition-all"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando ticket...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Ticket de Soporte
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Columna Derecha: Tarjeta WhatsApp Directo + Horarios */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta Contacto Directo por WhatsApp */}
            <div className="rounded-3xl bg-white border-2 border-amber-300/80 shadow-lg shadow-amber-900/5 p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Canal Directo
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                    Soporte por WhatsApp
                  </h2>
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed">
                ¿Necesitas escalar una incidencia urgente? Inicia un chat
                directo con nuestra mesa de ayuda. Si ya completaste tu nombre o
                asunto en el formulario, tu mensaje se prellena automáticamente.
              </p>

              {/* Vista previa dinámica del mensaje */}
              <div className="rounded-2xl bg-sand border border-goldBorder p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-bronze mb-1.5">
                  Mensaje predefinido listo para enviar:
                </p>
                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  &ldquo;{mensajeWhatsApp}&rdquo;
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 shadow-md shadow-emerald-700/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Escribir por WhatsApp ahora
                <ExternalLink className="w-4 h-4 opacity-85" />
              </a>
            </div>

            {/* Tarjeta Horarios y SLA */}
            <div className="rounded-3xl bg-sand border border-goldBorder p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-brand-bronze">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Horarios de Atención
                </h3>
              </div>

              <ul className="space-y-2.5 text-sm text-stone-700">
                <li className="flex justify-between gap-2 pb-2 border-b border-goldBorder/70">
                  <span className="font-medium">Lunes a Viernes</span>
                  <span className="text-stone-600">8:30 a.m. – 6:30 p.m.</span>
                </li>
                <li className="flex justify-between gap-2 pb-2 border-b border-goldBorder/70">
                  <span className="font-medium">Sábados</span>
                  <span className="text-stone-600">9:00 a.m. – 1:00 p.m.</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="font-medium">Plan Corporativo</span>
                  <span className="font-semibold text-amber-700">Guardia 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
