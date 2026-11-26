import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { admin, token, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-3 text-stone-600">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <p className="text-sm font-medium">Verificando sesión administrativa...</p>
      </div>
    );
  }

  if (!token || !admin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
