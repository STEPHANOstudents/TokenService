import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Lock, ArrowRight } from 'lucide-react';
import { TokenServiceLogo } from './TokenServiceLogo';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/servicios', label: 'Servicios', end: false },
  { to: '/planes', label: 'Planes', end: false },
  { to: '/soporte', label: 'Soporte', end: false },
] as const;

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 py-3 flex items-center justify-between gap-4">
          {/* Marca */}
          <Link
            to="/"
            onClick={cerrarMenu}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
          >
            <TokenServiceLogo size="md" />
          </Link>

          {/* Navegación escritorio */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sand text-brand-bronze font-semibold'
                      : 'text-stone-700 hover:text-amber-700 hover:bg-amber-50/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones escritorio */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/cotizar"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm shadow-amber-500/20 transition-all"
            >
              Cotizar
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/login"
              title="Acceso Administrativo"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-brand-bronze hover:bg-sand/70 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-stone-700 hover:bg-sand transition-colors"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-goldBorder shadow-lg">
          <div className="px-4 pt-3 pb-5 space-y-1.5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={cerrarMenu}
                className={({ isActive }) =>
                  `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sand text-brand-bronze font-semibold'
                      : 'text-stone-700 hover:bg-amber-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-3 mt-3 border-t border-goldBorder/70 flex flex-col gap-2">
              <Link
                to="/cotizar"
                onClick={cerrarMenu}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm"
              >
                Solicitar Cotización
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admin/login"
                onClick={cerrarMenu}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-brand-bronze hover:bg-sand/60"
              >
                <Lock className="w-3.5 h-3.5" />
                Acceso Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
