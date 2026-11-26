import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { TokenServiceLogo } from '../../components/TokenServiceLogo';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';

export function AdminLogin() {
  const { admin, token, cargando, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destino =
    (location.state as { from?: string } | null)?.from ||
    '/admin/conocimiento';

  if (!cargando && token && admin) {
    return <Navigate to={destino} replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    setEnviando(true);
    try {
      await login(email.trim(), password);
      navigate(destino, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-ivory to-ivory flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <TokenServiceLogo size="lg" />
          </div>
          <p className="text-sm text-stone-600">
            Panel Administrativo de Base de Conocimiento e IA
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-goldBorder shadow-xl shadow-amber-900/5 p-7 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-stone-900">Iniciar Sesión</h1>
            <p className="text-xs text-stone-500 mt-1">
              Acceso exclusivo para personal autorizado de TokenService.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tokenservice.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-stone-800 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-ivory border border-goldBorder text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 shadow-md shadow-amber-500/20 transition-all"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando credenciales...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar al Panel
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-brand-bronze transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la web pública
          </Link>
        </div>
      </div>
    </div>
  );
}
