import React, { Suspense, lazy } from 'react'; // 👈 Necesario para los tipos JSX
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext'; // 👈 Faltaba importar esto

// --- Layouts ---
import { MainLayout } from '../components/layout/MainLayout';
import AdminLayout from '../layouts/AdminLayout'; // 👈 Layout del Admin

// --- Componentes de Carga ---
import { GlobalLoading } from '../components/common/GlobalLoading';

// --- Páginas de Autenticación (Eager Loading para rapidez) ---
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
const AdminLogin = lazy(() => import('../features/admin/pages/AdminLogin'));
// --- Páginas de Admin (Lazy Loading) ---
const Dashboard = lazy(() => import('../features/admin/pages/Dashboard'));
const UsersManagement = lazy(() => import('../features/admin/pages/users/UsersManagement'));
const CourseStructure = lazy(() => import('../features/admin/pages/courses/CourseStructure'));
const CoursesList = lazy(() => import('../features/admin/pages/courses/CoursesList'));
const LessonContentEditor = lazy(() => import('../features/admin/pages/courses/LessonContentEditor'));
const CreateCourse = lazy(() => import('../features/admin/pages/courses/CreateCourse'));
const ProductList = lazy(() => import('../features/admin/pages/products/ProductList'));
const DecksList = lazy(() => import('../features/admin/pages/study/DecksList'));
const DeckDetail = lazy(() => import('../features/admin/pages/study/DeckDetail'));
const UserDetail = lazy(() => import('../features/admin/pages/users/tabs/UserDetail'));

// --- Páginas Principales (Estudiante) ---
// CoursesLobby y LearnMap son el "núcleo", podrían ser eager o lazy. Lazy para mejorar TTI general.
const CoursesLobby = lazy(() => import('../pages/learn/CoursesLobby'));
const LearnMap = lazy(() => import('../pages/learn/LearnMap'));
const LessonContainer = lazy(() => import('../features/lesson/pages/LessonContainer'));
const UserProfile = lazy(() => import('../pages/profile/UserProfile'));
const GemShop = lazy(() => import('../features/shop/pages/GemShop'));

// --- Páginas de Estudio ---
const StudyHub = lazy(() => import('../features/study/pages/StudyHub'));
const StudySession = lazy(() => import('../features/study/pages/StudySession'));

// --- PvP Pages ---
const PvpLobby = lazy(() => import('../features/pvp/pages/PvpLobby'));
const PvpMatchContainer = lazy(() => import('../features/pvp/pages/PvpMatchContainer'));
const PvpResults = lazy(() => import('../features/pvp/pages/PvpResults'));

// --- Raid Page ---
const RaidGameContainer = lazy(() => import('../features/raid/pages/RaidGameContainer'));

// --- Clan Pages ---
const ClanLobby = lazy(() => import('../features/clan/pages/ClanLobby'));
const ClanBrowser = lazy(() => import('../features/clan/pages/ClanBrowser'));
const CreateClan = lazy(() => import('../features/clan/pages/CreateClan'));
const ClanDetail = lazy(() => import('../features/clan/pages/ClanDetail'));

// --- Tower Page ---
const TowerPage = lazy(() => import('../features/tower/pages/TowerPage'));

// Componente para proteger rutas de admin
// Usamos React.ReactElement para evitar errores de tipo con JSX
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <GlobalLoading />;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  if (user?.role !== 'admin' && user?.role !== 'moderator') return <Navigate to="/learn" />;

  return children;
};

export const AppRouter = () => {
  return (
    <Suspense fallback={<GlobalLoading />}>
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

          {/* 👇 TOWER (Nueva Ruta) */}
          <Route path="/tower" element={<TowerPage />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-10 text-center">404 - Página no encontrada</div>} />
      </Routes>
    </Suspense>
  );
};