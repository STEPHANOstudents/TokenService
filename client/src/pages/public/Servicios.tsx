import { Link } from 'react-router-dom';
import {
  Network,
  Server,
  Headphones,
  ShieldCheck,
  Check,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface ServicioCatalogo {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icono: typeof Network;
  beneficios: string[];
  consultaSugerida: string;
  cotizarParam: string;
}

const SERVICIOS: ServicioCatalogo[] = [
  {
    id: 'redes',
    titulo: 'Infraestructura de Redes y Cableado Estructurado',
    subtitulo: 'Conectividad estable, ordenada y certificada',
    descripcion:
      'Diseñamos, implementamos y mantenemos redes corporativas de alto rendimiento para oficinas, almacenes y sedes empresariales.',
    icono: Network,
    beneficios: [
      'Cableado estructurado certificado Cat6 y Cat6A',
      'Configuración de switches administrables y segmentación por VLANs',
      'Redes Wi-Fi empresariales de alta densidad y roaming fluido',
      'Ordenamiento, rotulado y documentación profesional de racks',
    ],
    consultaSugerida: '¿Qué incluye su servicio de redes y cableado estructurado?',
    cotizarParam: 'Infraestructura de Redes y Cableado',
  },
  {
    id: 'servidores',
    titulo: 'Administración de Servidores Linux/Windows y Backups',
    subtitulo: 'Estabilidad, virtualización y respaldos automatizados',
    descripcion:
      'Operamos servidores críticos físicos y virtuales, garantizando parches al día, control de accesos y recuperación rápida ante incidentes.',
    icono: Server,
    beneficios: [
      'Administración de Windows Server, Ubuntu, Debian, Proxmox y VMware',
      'Implementación de Active Directory y políticas de grupo (GPO)',
      'Backups automatizados locales y en la nube bajo regla 3-2-1',
      'Planes documentados de recuperación ante desastres (DRP)',
    ],
    consultaSugerida: '¿Qué servidores administran y cómo funcionan sus backups?',
    cotizarParam: 'Administración de Servidores y Backups',
  },
  {
    id: 'soporte',
    titulo: 'Soporte TI Gestionado y Mesa de Ayuda',
    subtitulo: 'Atención remota ágil y visitas técnicas en Lima',
    descripcion:
      'Resolvemos incidencias del día a día en estaciones de trabajo, impresoras, correo corporativo y software de oficina con SLA garantizado.',
    icono: Headphones,
    beneficios: [
      'Soporte remoto prioritario y visitas técnicas presenciales programadas',
      'Mantenimiento preventivo de hardware y optimización del sistema',
      'Gestión de inventario TI y alta/baja segura de usuarios',
      'Reportes mensuales de tickets atendidos y cumplimiento de SLA',
    ],
    consultaSugerida: '¿Cómo funciona su soporte TI gestionado y qué horarios tienen?',
    cotizarParam: 'Soporte TI Gestionado',
  },
  {
    id: 'ciberseguridad',
    titulo: 'Ciberseguridad Perimetral, Firewalls y Auditoría Básica',
    subtitulo: 'Defensa activa para tu red y usuarios remotos',
    descripcion:
      'Reducimos la superficie de ataque de tu organización con perímetros endurecidos, acceso remoto cifrado y prevención frente a ransomware.',
    icono: ShieldCheck,
    beneficios: [
      'Implementación y gestión de firewalls Fortinet, MikroTik y pfSense',
      'Configuración de VPNs seguras para teletrabajo y sucursales',
      'Protección anti-ransomware y endurecimiento de endpoints',
      'Auditorías básicas de vulnerabilidades y recomendaciones ejecutivas',
    ],
    consultaSugerida: '¿Qué servicios de ciberseguridad y firewalls manejan?',
    cotizarParam: 'Ciberseguridad Perimetral y Firewalls',
  },
];

function abrirChatConPregunta(pregunta: string): void {
  window.dispatchEvent(
    new CustomEvent('tokenservice:open-chat', {
      detail: { pregunta },
    })
  );
}

export function Servicios() {
  return (
    <div className="bg-ivory">
      {/* Encabezado */}
      <section className="border-b border-goldBorder/70 bg-gradient-to-b from-amber-50/70 to-ivory py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Catálogo de Servicios TI
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Ingeniería práctica para mantener tu operación siempre activa
            </h1>
            <p className="mt-3 text-stone-600 text-base leading-relaxed">
              Ejecutamos proyectos puntuales llave en mano y contratos mensuales
              de gestión continua adaptados al tamaño real de tu infraestructura.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de servicios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SERVICIOS.map((servicio) => {
            const Icon = servicio.icono;
            return (
              <article
                key={servicio.id}
                className="bg-white rounded-3xl border border-goldBorder shadow-sm hover:shadow-md hover:shadow-amber-900/5 transition-all p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-sm shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                        {servicio.subtitulo}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-stone-900">
                        {servicio.titulo}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-stone-600 leading-relaxed">
                    {servicio.descripcion}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {servicio.beneficios.map((beneficio) => (
                      <li
                        key={beneficio}
                        className="flex items-start gap-2.5 text-sm text-stone-700"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-goldBorder/70 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/cotizar?servicio=${encodeURIComponent(servicio.cotizarParam)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all"
                  >
                    Cotizar este servicio
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => abrirChatConPregunta(servicio.consultaSugerida)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-bronze bg-sand hover:bg-amber-100/80 border border-goldBorder transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Preguntar al asistente
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Enlace a planes */}
        <div className="mt-12 rounded-2xl bg-sand border border-goldBorder p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              ¿Buscas mantenimiento TI mensual con SLA fijo?
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Compara nuestros planes Básico, Pyme y Corporativo según el número
              de equipos de tu oficina.
            </p>
          </div>
          <Link
            to="/planes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-bronze hover:bg-brand-darkBronze transition-colors shrink-0"
          >
            Ver Planes y Precios
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
