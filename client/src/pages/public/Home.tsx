import { Link } from 'react-router-dom';
import {
  Network,
  Server,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const PILARES = [
  {
    titulo: 'Infraestructura de Redes',
    descripcion:
      'Cableado estructurado certificado Cat6/Cat6A, switches administrables, VLANs, Wi-Fi empresarial y ordenamiento de racks.',
    icono: Network,
    badge: 'Alta disponibilidad',
  },
  {
    titulo: 'Servidores y Backups',
    descripcion:
      'Administración Linux y Windows Server, virtualización Proxmox/VMware, Active Directory y copias de seguridad regla 3-2-1.',
    icono: Server,
    badge: 'Continuidad operativa',
  },
  {
    titulo: 'Soporte TI Gestionado',
    descripcion:
      'Mesa de ayuda remota y visitas técnicas presenciales en Lima Metropolitana con acuerdos de nivel de servicio claros (SLA).',
    icono: Headphones,
    badge: 'SLA desde 1 hora',
  },
  {
    titulo: 'Ciberseguridad Perimetral',
    descripcion:
      'Firewalls empresariales Fortinet/MikroTik/pfSense, VPNs seguras, protección anti-ransomware y auditorías básicas.',
    icono: ShieldCheck,
    badge: 'Protección integral',
  },
] as const;

const METRICAS = [
  { valor: '1h', etiqueta: 'SLA Corporativo' },
  { valor: '24/7', etiqueta: 'Monitoreo Proactivo' },
  { valor: '99.9%', etiqueta: 'Continuidad en Redes' },
  { valor: 'Lima', etiqueta: 'Soporte Presencial y Remoto' },
] as const;

function abrirChat(pregunta?: string): void {
  window.dispatchEvent(
    new CustomEvent('tokenservice:open-chat', {
      detail: { pregunta },
    })
  );
}

export function Home() {
  return (
    <div className="bg-ivory">
      {/* Hero luminoso crema/dorado */}
      <section className="relative overflow-hidden border-b border-goldBorder/70 bg-gradient-to-b from-amber-50/70 via-ivory to-ivory">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Propuesta de valor */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-goldBorder shadow-sm text-xs font-semibold text-brand-bronze">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Consultora TI Empresarial en Lima, Perú
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.12]">
                Infraestructura TI segura, soporte ágil y{' '}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-brand-bronze bg-clip-text text-transparent">
                  orientación inteligente 24/7
                </span>
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
                En <strong>TokenService</strong> diseñamos, administramos y
                protegemos las redes, servidores y estaciones de trabajo de tu
                empresa con planes claros, técnicos certificados y tiempos de
                respuesta garantizados.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/servicios"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 transition-all"
                >
                  Explorar Servicios
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/planes"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-brand-bronze bg-white hover:bg-sand border border-goldBorder shadow-sm transition-colors"
                >
                  Ver Planes y SLA
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-goldBorder/70">
                {METRICAS.map((item) => (
                  <div key={item.etiqueta}>
                    <p className="text-2xl font-bold text-amber-600">{item.valor}</p>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      {item.etiqueta}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjeta interactiva invitando a probar el asistente virtual */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-goldBorder shadow-xl shadow-amber-900/5 p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-2xl bg-sand border border-goldBorder flex items-center justify-center shadow-sm p-1">
                      <img
                        src="/tokenIconIA.png"
                        alt="Asistente TokenService"
                        className="w-10 h-10 object-contain drop-shadow-sm"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        Asistente Virtual TokenService
                      </p>
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Disponible ahora · Sin registro
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed">
                  ¿Tienes dudas sobre nuestros planes, horarios, cobertura en
                  Lima o servicios de ciberseguridad? Prueba nuestro asistente
                  con IA en la esquina inferior derecha o elige una consulta
                  rápida:
                </p>

                <div className="space-y-2.5">
                  {[
                    '¿Qué incluye el Plan Pyme y cuál es su SLA?',
                    '¿Qué servicios de ciberseguridad ofrecen?',
                    '¿Cómo abro un ticket de soporte técnico?',
                  ].map((pregunta) => (
                    <button
                      key={pregunta}
                      type="button"
                      onClick={() => abrirChat(pregunta)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-ivory hover:bg-sand border border-goldBorder/80 text-xs sm:text-sm font-medium text-stone-700 hover:text-brand-bronze flex items-center justify-between gap-2 transition-colors group"
                    >
                      <span>{pregunta}</span>
                      <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => abrirChat()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-brand-bronze bg-sand hover:bg-amber-100/80 border border-goldBorder transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Abrir Asistente Virtual
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de 4 Pilares */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Nuestros Pilares Tecnológicos
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900">
            Soluciones integrales para la continuidad de tu negocio
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Acompañamos a pymes y corporaciones con ingeniería aplicada,
            mantenimiento preventivo y seguridad de alto estándar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILARES.map((pilar) => {
            const Icon = pilar.icono;
            return (
              <div
                key={pilar.titulo}
                className="bg-white rounded-2xl border border-goldBorder p-6 shadow-sm hover:shadow-lg hover:shadow-amber-900/5 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-sand border border-goldBorder flex items-center justify-center text-amber-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-brand-bronze border border-amber-200/70">
                      {pilar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">
                    {pilar.titulo}
                  </h3>
                  <p className="mt-2.5 text-sm text-stone-600 leading-relaxed">
                    {pilar.descripcion}
                  </p>
                </div>

                <Link
                  to="/servicios"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-brand-bronze transition-colors"
                >
                  Conocer más
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Banner CTA final */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-500 to-brand-bronze p-8 sm:p-10 text-white shadow-lg shadow-amber-900/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-100">
              <Clock className="w-4 h-4" />
              Propuesta formal en menos de 24 horas hábiles
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              ¿Listo para profesionalizar el soporte TI de tu empresa?
            </h2>
            <p className="text-amber-50/95 text-sm sm:text-base">
              Solicita una evaluación sin compromiso o conversa ahora mismo con
              nuestro equipo técnico.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/cotizar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-white text-brand-bronze hover:bg-ivory shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Solicitar Cotización
            </Link>
            <Link
              to="/soporte"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-amber-900/30 hover:bg-amber-900/45 text-white border border-amber-200/40 transition-colors"
            >
              Ir a Soporte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
