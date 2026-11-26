import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { Home } from './pages/public/Home';
import { Servicios } from './pages/public/Servicios';
import { Planes } from './pages/public/Planes';
import { Soporte } from './pages/public/Soporte';
import { Cotizar } from './pages/public/Cotizar';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminConocimiento } from './pages/admin/AdminConocimiento';
import { AdminRestricciones } from './pages/admin/AdminRestricciones';
import { AdminHistorial } from './pages/admin/AdminHistorial';
import { AdminSolicitudes } from './pages/admin/AdminSolicitudes';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Sitio Corporativo Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/cotizar" element={<Cotizar />} />
        </Route>

        {/* Login Administrativo */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Panel Administrativo Protegido con JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/conocimiento" replace />} />
            <Route path="conocimiento" element={<AdminConocimiento />} />
            <Route path="restricciones" element={<AdminRestricciones />} />
            <Route path="historial" element={<AdminHistorial />} />
            <Route path="solicitudes" element={<AdminSolicitudes />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
