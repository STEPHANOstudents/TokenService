import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, Lock } from 'lucide-react';
import { TokenServiceLogo } from './TokenServiceLogo';

export function Footer() {
  return (
    <footer className="bg-sand border-t border-goldBorder text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Columna 1: Marca y descripción */}
          <div className="space-y-4">
            <TokenServiceLogo size="md" />
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              Consultora especializada en Soporte TI, infraestructura de redes,
              administración de servidores y ciberseguridad perimetral para
              empresas en Lima y todo el Perú.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-goldBorder text-xs font-medium text-brand-bronze">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mesa de ayuda activa y monitoreo 24/7
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-700 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-amber-700 transition-colors">
                  Catálogo de Servicios TI
                </Link>
              </li>
              <li>
                <Link to="/planes" className="hover:text-amber-700 transition-colors">
                  Planes de Mantenimiento y SLA
                </Link>
              </li>
              <li>
                <Link to="/soporte" className="hover:text-amber-700 transition-colors">
                  Centro de Soporte y Tickets
                </Link>
              </li>
              <li>
                <Link to="/cotizar" className="hover:text-amber-700 transition-colors">
                  Solicitar Cotización
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto en Lima, Perú */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-4">
              Contacto Corporativo
            </h3>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Av. Javier Prado Este 456, Of. 702 — San Isidro, Lima, Perú</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span>contacto@tokenservice.pe</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>+51 (01) 642-8900</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  L–V: 8:30 a.m. – 6:30 p.m. · Sáb: 9:00 a.m. – 1:00 p.m.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-goldBorder/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} TokenService S.A.C. — Todos los derechos reservados.</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-brand-bronze transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Acceso Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
