import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShieldAlert,
  MessageSquareText,
  Inbox,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { TokenServiceLogo } from '../../components/TokenServiceLogo';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  {
    to: '/admin/conocimiento',
    label: 'Base de Conocimiento',
    icon: BookOpen,
  },
  {
    to: '/admin/restricciones',
    label: 'Restricciones IA',
    icon: ShieldAlert,
  },
  {
    to: '/admin/historial',
    label: 'Historial de Chats',
    icon: MessageSquareText,
  },
  {
    to: '/admin/solicitudes',
    label: 'Tickets y Cotizaciones',
    icon: Inbox,
  },
] as const;

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarMovil, setSidebarMovil] = useState(false);

  const handleLogout = (): void => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-goldBorder">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-goldBorder/80 flex items-center justify-between">
        <div>
          <TokenServiceLogo size="sm" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-bronze mt-1.5">
            Panel de Administración
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarMovil(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:bg-sand"
          aria-label="Cerrar menú lateral"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Panel Administrativo">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarMovil(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/25'
                    : 'text-stone-700 hover:bg-sand hover:text-brand-bronze'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Pie lateral: ver web pública + perfil + logout */}
      <div className="p-4 border-t border-goldBorder/80 space-y-3 bg-ivory/70">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-bronze bg-sand hover:bg-amber-100/90 border border-goldBorder transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          Ver Web Pública
        </a>

        {admin && (
          <div className="px-3 py-2 rounded-xl bg-white border border-goldBorder/80">
            <p className="text-xs font-bold text-stone-900 truncate">
              {admin.nombre}
            </p>
            <p className="text-[11px] text-stone-500 truncate">{admin.email}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar escritorio fija */}
      <aside className="hidden lg:block w-68 xl:w-72 shrink-0 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Sidebar móvil overlay */}
      {sidebarMovil && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent()}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setSidebarMovil(false)}
            className="flex-1 bg-stone-900/35 backdrop-blur-xs"
          />
        </div>
      )}

      {/* Área principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra superior móvil */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-goldBorder px-4 py-3 flex items-center justify-between">
          <TokenServiceLogo size="sm" />
          <button
            type="button"
            onClick={() => setSidebarMovil(true)}
            className="p-2 rounded-xl bg-sand text-brand-bronze border border-goldBorder"
            aria-label="Abrir navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
