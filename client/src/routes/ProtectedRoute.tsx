import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 👇 Importamos el nuevo loading
import { GlobalLoading } from '../components/common/GlobalLoading';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Mostrar pantalla de carga Retro mientras verificamos sesión
  if (isLoading) {
    return <GlobalLoading />;
  }

  // 2. Si no está autenticado, adiós
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Renderizar contenido
  return <Outlet />;
};