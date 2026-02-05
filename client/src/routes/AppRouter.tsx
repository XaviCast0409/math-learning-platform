import React from 'react'; // 👈 Necesario para los tipos JSX
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext'; // 👈 Faltaba importar esto

// --- Layouts ---
import { MainLayout } from '../components/layout/MainLayout';
import AdminLayout from '../layouts/AdminLayout'; // 👈 Layout del Admin

// --- Páginas de Autenticación ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminLogin from '../pages/admin/AdminLogin'; // 👈 Login de Admin

// --- Páginas de Admin ---
import Dashboard from '../pages/admin/Dashboard';
import UsersManagement from '../pages/admin/users/UsersManagement';
import CourseStructure from '../pages/admin/courses/CourseStructure';
import CoursesList from '../pages/admin/courses/CoursesList';
import LessonContentEditor from '../pages/admin/courses/LessonContentEditor';
import CreateCourse from '../pages/admin/courses/CreateCourse';
import ProductList from '../pages/admin/products/ProductList';
import DecksList from '../pages/admin/study/DecksList';
import DeckDetail from '../pages/admin/study/DeckDetail';
import UserDetail from '../pages/admin/users/tabs/UserDetail'; // Importar

// --- Páginas Principales (Estudiante) ---
import CoursesLobby from '../pages/learn/CoursesLobby';
import LearnMap from '../pages/learn/LearnMap';
import LessonContainer from '../pages/lesson/LessonContainer';
import UserProfile from '../pages/profile/UserProfile';
import GemShop from '../pages/shop/GemShop';

// --- Páginas de Estudio ---
import { StudyHub } from '../pages/study/StudyHub';
import { StudySession } from '../pages/study/StudySession';

// --- PvP Pages ---
import PvpLobby from '../pages/pvp/PvpLobby';
import PvpMatchContainer from '../pages/pvp/PvpMatchContainer';
import PvpResults from '../pages/pvp/PvpResults';

// --- Raid Page ---
import RaidGameContainer from '../pages/raid/RaidGameContainer';

// Imports...
import ClanLobby from '../pages/clan/ClanLobby';
import ClanBrowser from '../pages/clan/ClanBrowser';
import CreateClan from '../pages/clan/CreateClan'; //
import ClanDetail from '../pages/clan/ClanDetail';

// Componente para proteger rutas de admin
// Usamos React.ReactElement para evitar errores de tipo con JSX
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>; // O tu componente GlobalLoading
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  if (user?.role !== 'admin' && user?.role !== 'moderator') return <Navigate to="/learn" />;

  return children;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* =========================================
          1. RUTAS PÚBLICAS
      ========================================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Login específico de Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Redirección raíz */}
      <Route path="/" element={<Navigate to="/learn" replace />} />

      {/* =========================================
          2. RUTAS DE ADMINISTRADOR (NUEVO)
      ========================================= */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        {/* Al entrar a /admin, redirigir a dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        {/* Placeholders para futuras rutas CRUD */}
        <Route path="products" element={<ProductList />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="courses" element={<CoursesList />} />
        <Route path="courses/:id/structure" element={<CourseStructure />} />
        <Route path="lessons/:id" element={<LessonContentEditor />} />
        <Route path="courses/new" element={<CreateCourse />} />
        <Route path="study/decks" element={<DecksList />} />
        <Route path="study/decks/:id" element={<DeckDetail />} />
        <Route path="users/:id" element={<UserDetail />} /> {/* 👈 NUEVA RUTA */}
      </Route>

      {/* =========================================
          3. RUTAS DE ESTUDIANTE (PROTEGIDAS)
      ========================================= */}
      <Route element={<ProtectedRoute />}>

        {/* A. CON MENÚ INFERIOR (MainLayout) */}
        <Route element={
          <MainLayout>
            <Outlet />
          </MainLayout>
        }>
          <Route path="/learn" element={<CoursesLobby />} />
          <Route path="/learn/course/:courseId" element={<LearnMap />} />
          <Route path="/shop" element={<GemShop />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/study" element={<StudyHub />} />
          <Route path="/clan" element={<ClanLobby />} />
          <Route path="/clan/browser" element={<ClanBrowser />} />
        </Route>

        {/* B. PANTALLA COMPLETA (Sin Menú) */}

        {/* Lección */}
        <Route path="/lesson/:id" element={<LessonContainer />} />

        {/* Estudio */}
        <Route path="/study/session/:deckId" element={<StudySession />} />

        {/* PvP */}
        <Route path="/pvp" element={<PvpLobby />} />
        <Route path="/pvp/match/:id" element={<PvpMatchContainer />} />
        <Route path="/pvp/results/:id" element={<PvpResults />} />

        {/* 👇 RAID (Nueva Ruta) */}
        <Route path="/raid/:raidId" element={<RaidGameContainer />} />
        {/* rutas clan */}
        <Route path="/clan/:id" element={<ClanDetail />} />

        <Route path="/clan/create" element={<CreateClan />} />

      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-10 text-center">404 - Página no encontrada</div>} />
    </Routes>
  );
};