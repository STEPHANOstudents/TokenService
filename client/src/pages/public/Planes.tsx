import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface PlanTI {
  id: string;
  nombre: string;
  etiqueta: string;
  precio: string;
  periodicidad: string;
  notaPrecio: string;
  descripcion: string;
  destacado: boolean;
  sla: string;
  equipos: string;
  caracteristicas: string[];
  cotizarParam: string;
}

const PLANES: PlanTI[] = [
  {
    id: 'basico',
    nombre: 'Plan Básico',
    etiqueta: 'Pequeñas oficinas',
    precio: 'S/ 650',
    periodicidad: '/ mes',
    notaPrecio: 'No incluye IGV',
    descripcion:
      'Ideal para equipos pequeños que buscan respaldo técnico confiable y mantenimiento preventivo sin sobredimensionar costos.',
    destacado: false,
    sla: 'SLA 8 horas hábiles',
    equipos: 'Hasta 10 equipos',
    caracteristicas: [
      'Cobertura para hasta 10 equipos de oficina',
      'Soporte técnico remoto de lunes a viernes (horario de oficina)',
      'Mantenimiento preventivo programado',
      'Monitoreo básico de salud de equipos',
      'Acuerdo de respuesta SLA de 8 horas hábiles',
    ],
    cotizarParam: 'Plan Básico (S/ 650/mes)',
  },
  {
    id: 'pyme',
    nombre: 'Plan Pyme',
    etiqueta: 'Más popular',
    precio: 'S/ 1,450',
    periodicidad: '/ mes',
    notaPrecio: 'No incluye IGV',
    descripcion:
      'Pensado para empresas en crecimiento que requieren soporte remoto prioritario, visitas presenciales y respaldo de servidores.',
    destacado: true,
    sla: 'SLA 4 horas hábiles',
    equipos: 'Hasta 30 equipos',
    caracteristicas: [
      'Cobertura para hasta 30 equipos',
      'Soporte técnico remoto prioritario',
      '2 visitas técnicas presenciales al mes en Lima Metropolitana',
      'Gestión de copias de seguridad (backups)',
      'Soporte a servidores básicos y red interna',
      'Acuerdo de respuesta SLA de 4 horas hábiles',
    ],
    cotizarParam: 'Plan Pyme (S/ 1,450/mes)',
  },
  {
    id: 'corporativo',
    nombre: 'Plan Corporativo',
    etiqueta: 'Operaciones críticas',
    precio: 'A medida',
    periodicidad: '',
    notaPrecio: 'Según alcance y sedes',
    descripcion:
      'Continuidad total para organizaciones con alta exigencia operativa, múltiples sedes y monitoreo permanente 24/7.',
    destacado: false,
    sla: 'SLA 1 hora',
    equipos: 'Equipos ilimitados',
    caracteristicas: [
      'Cobertura para equipos ilimitados',
      'Monitoreo proactivo 24/7 de infraestructura y servidores',
      'Mesa de ayuda dedicada y guardia 24/7',
      'Visitas presenciales ilimitadas según cronograma',
      'Gestión continua de ciberseguridad y firewalls',
      'Acuerdo de respuesta SLA crítico de 1 hora',
    ],
    cotizarParam: 'Plan Corporativo (A medida)',
  },
];

export function Planes() {
  return (
    <div className="bg-ivory">
      {/* Encabezado */}
      <section className="border-b border-goldBorder/70 bg-gradient-to-b from-amber-50/70 to-ivory py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Planes de Mantenimiento TI y SLA
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Transparencia total en tiempos de respuesta y cobertura
          </h1>
          <p className="mt-3 text-stone-600 max-w-2xl mx-auto text-base">
            Elige el plan que mejor acompaña la operación de tu empresa. Todos
            nuestros acuerdos incluyen reportes periódicos y atención directa
            por especialistas.
          </p>
        </div>
      </section>

      {/* Tarjetas de planes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANES.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-white p-7 sm:p-8 flex flex-col justify-between transition-all ${
                plan.destacado
                  ? 'border-2 border-amber-500 shadow-xl shadow-amber-500/15 lg:-translate-y-2'
                  : 'border border-goldBorder shadow-sm hover:shadow-md'
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {plan.etiqueta}
                </div>
              )}

              <div>
                {!plan.destacado && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-sand text-brand-bronze border border-goldBorder">
                    {plan.etiqueta}
                  </span>
                )}

                <h2 className="mt-3 text-2xl font-bold text-stone-900">
                  {plan.nombre}
                </h2>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  {plan.descripcion}
                </p>

                <div className="mt-6 pb-6 border-b border-goldBorder/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-stone-900 tracking-tight">
                      {plan.precio}
                    </span>
                    {plan.periodicidad && (
                      <span className="text-sm font-medium text-stone-500">
                        {plan.periodicidad}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{plan.notaPrecio}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-brand-bronze border border-amber-200/80">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {plan.sla}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sand text-stone-700 border border-goldBorder">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      {plan.equipos}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.caracteristicas.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-stone-700"
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  to={`/cotizar?plan=${encodeURIComponent(plan.cotizarParam)}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.destacado
                      ? 'text-white bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20'
                      : 'text-brand-bronze bg-sand hover:bg-amber-100/80 border border-goldBorder'
                  }`}
                >
                  Solicitar {plan.nombre}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Nota de cotización */}
        <div className="mt-12 text-center bg-white border border-goldBorder rounded-2xl p-6 max-w-3xl mx-auto">
          <p className="text-sm text-stone-600">
            ¿Necesitas combinar mantenimiento mensual con un proyecto de cableado,
            migración de servidores o múltiples sedes?{' '}
            <Link
              to="/cotizar"
              className="font-semibold text-amber-700 hover:text-brand-bronze underline underline-offset-2"
            >
              Solicita una cotización personalizada
            </Link>{' '}
            y recibe una propuesta formal en menos de 24 horas hábiles.
          </p>
        </div>
      </section>
    </div>
  );
}
