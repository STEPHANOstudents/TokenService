import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ShieldCheck,
  Clock,
  Sparkles,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { ApiError, crearSolicitudPublica } from '../../services/api';
import type { SolicitudContacto } from '../../services/api';

const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(
    /\D/g,
    ''
  ) || '';

const OPCIONES_INTERES = [
  'Plan Básico (S/ 650/mes)',
  'Plan Pyme (S/ 1,450/mes)',
  'Plan Corporativo (A medida)',
  'Infraestructura de Redes y Cableado',
  'Administración de Servidores y Backups',
  'Soporte TI Gestionado',
  'Ciberseguridad Perimetral y Firewalls',
  'Proyecto TI personalizado',
] as const;

interface CotizarFormState {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  servicioInteres: string;
  mensaje: string;
}

export function Cotizar() {
  const [searchParams] = useSearchParams();
  const preseleccionado =
    searchParams.get('plan') || searchParams.get('servicio') || '';

  const opcionInicial = OPCIONES_INTERES.includes(
    preseleccionado as (typeof OPCIONES_INTERES)[number]
  )
    ? preseleccionado
    : OPCIONES_INTERES[1];

  const [form, setForm] = useState<CotizarFormState>({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    servicioInteres: opcionInicial,
    mensaje: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cotizacionCreada, setCotizacionCreada] =
    useState<SolicitudContacto | null>(null);

  const mensajeWhatsApp = useMemo(() => {
    const nombre = form.nombre.trim();
    const empresa = form.empresa.trim();
    const interes = form.servicioInteres.trim();
    const detalle = form.mensaje.trim();

    const saludo = nombre
      ? `Hola equipo de TokenService, soy ${nombre}${empresa ? ` de ${empresa}` : ''}.`
      : `Hola equipo de TokenService${empresa ? `, escribo de ${empresa}` : ''}.`;

    const cuerpo = ` Quisiera solicitar una cotización para: ${interes}.`;
    const extra = detalle ? ` Detalle: ${detalle}` : '';
    return `${saludo}${cuerpo}${extra}`;
  }, [form.nombre, form.empresa, form.servicioInteres, form.mensaje]);

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;
  }, [mensajeWhatsApp]);

  const handleChange = (
    field: keyof CotizarFormState,
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
      !form.servicioInteres.trim() ||
      !form.mensaje.trim()
    ) {
      setError('Por favor completa todos los campos obligatorios marcados con *.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await crearSolicitudPublica({
        tipo: 'COTIZACION',
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        empresa: form.empresa.trim() || undefined,
        asunto: `Cotización: ${form.servicioInteres.trim()}`,
        mensaje: form.mensaje.trim(),
      });
      setCotizacionCreada(resultado);
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        servicioInteres: opcionInicial,
        mensaje: '',
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'No se pudo enviar tu solicitud de cotización. Intenta nuevamente.'
        );
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
              Propuestas Comerciales
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Solicita una cotización a medida para tu empresa
            </h1>
            <p className="mt-3 text-stone-600 text-base">
              Indícanos el servicio o plan de tu interés y el tamaño aproximado
              de tu infraestructura. Te enviaremos una propuesta formal en menos
              de 24 horas hábiles.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario + Beneficios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-goldBorder shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 border-b border-goldBorder/70">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Formulario de Cotización
                </h2>
                <p className="text-xs text-stone-500">
                  Sin compromiso · Evaluación técnica incluida
                </p>
              </div>
            </div>

            {cotizacionCreada ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-900">
                      ¡Solicitud de cotización #{cotizacionCreada.id} recibida!
                    </h3>
                    <p className="text-sm text-emerald-800 mt-1">
                      Gracias, <strong>{cotizacionCreada.nombre}</strong>. Hemos
                      registrado tu interés en{' '}
                      <strong>{cotizacionCreada.asunto}</strong>. Nuestro equipo
                      comercial te escribirá a{' '}
                      <strong>{cotizacionCreada.email}</strong> en menos de 24
                      horas hábiles.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setCotizacionCreada(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100/60 transition-colors"
                  >
                    Enviar otra solicitud
                  </button>
                  <Link
                    to="/planes"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                  >
                    Revisar planes
                  </Link>
                </div>
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
                      htmlFor="cotizar-nombre"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Nombre completo <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="cotizar-nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Ej. Andrea Paredes"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cotizar-email"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Correo corporativo <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="cotizar-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="andrea@empresa.pe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cotizar-telefono"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="cotizar-telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="Ej. 987 654 321"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cotizar-empresa"
                      className="block text-sm font-medium text-stone-800 mb-1.5"
                    >
                      Empresa
                    </label>
                    <input
                      id="cotizar-empresa"
                      type="text"
                      value={form.empresa}
                      onChange={(e) => handleChange('empresa', e.target.value)}
                      placeholder="Razón social o nombre comercial"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cotizar-servicio"
                    className="block text-sm font-medium text-stone-800 mb-1.5"
                  >
                    Servicio o Plan de interés{' '}
                    <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="cotizar-servicio"
                    value={form.servicioInteres}
                    onChange={(e) =>
                      handleChange('servicioInteres', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  >
                    {OPCIONES_INTERES.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cotizar-mensaje"
                    className="block text-sm font-medium text-stone-800 mb-1.5"
                  >
                    Detalles del requerimiento{' '}
                    <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    id="cotizar-mensaje"
                    rows={4}
                    required
                    value={form.mensaje}
                    onChange={(e) => handleChange('mensaje', e.target.value)}
                    placeholder="Indica cantidad aproximada de equipos, servidores, sedes o alcance del proyecto que deseas cotizar..."
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
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Solicitar Cotización Formal
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Lateral informativo */}
          <div className="lg:col-span-4 space-y-5">
            {/* Tarjeta Cotizar directo por WhatsApp */}
            <div className="rounded-3xl bg-white border-2 border-amber-300/80 shadow-md shadow-amber-900/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Atención Inmediata
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">
                    Cotizar por WhatsApp
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                ¿Prefieres coordinar tu cotización directamente? Envíanos tu
                requerimiento por WhatsApp con el servicio seleccionado ya
                prellenado.
              </p>

              <div className="rounded-2xl bg-sand border border-goldBorder p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-bronze mb-1">
                  Vista previa del mensaje:
                </p>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  &ldquo;{mensajeWhatsApp}&rdquo;
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Cotizar por WhatsApp
                <ExternalLink className="w-4 h-4 opacity-85" />
              </a>
            </div>

            <div className="rounded-3xl bg-sand border border-goldBorder p-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-bronze">
                <Sparkles className="w-4 h-4 text-amber-600" />
                ¿Qué sucede después?
              </div>
              <ol className="space-y-4 text-sm text-stone-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Revisamos tu requerimiento y validamos el alcance técnico
                    junto a un ingeniero especialista.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Preparamos una propuesta económica transparente con SLA,
                    entregables y cronograma.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Te enviamos la cotización formal en menos de 24 horas
                    hábiles.
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-3xl bg-white border border-goldBorder p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Garantía TokenService
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Trabajamos con acuerdos de confidencialidad (NDA), facturación
                formal en Perú y soporte directo sin intermediarios.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-brand-bronze">
                <Clock className="w-4 h-4 text-amber-600" />
                Respuesta garantizada &lt; 24h hábiles
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
