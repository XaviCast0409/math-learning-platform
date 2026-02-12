import { Suspense, lazy } from 'react';
import {
  Users, BookOpen, ShoppingBag, Activity
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';

// Lazy loading del componente pesado de gráficos (recharts es grande)
const DashboardCharts = lazy(() => import('../../components/admin/DashboardCharts'));

// Skeleton simple mientras carga el gráfico
const ChartsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="lg:col-span-2 h-80 bg-gray-200 rounded-2xl"></div>
    <div className="h-80 bg-gray-200 rounded-2xl"></div>
  </div>
);


export default function Dashboard() {
  const { stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return <div className="p-10 text-center text-gray-400">Cargando métricas...</div>;
  if (isError || !stats) return <div className="p-10 text-center text-red-500">Error al cargar datos</div>;

  return (
    <div className="space-y-6">

      {/* 1. Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Resumen General</h1>
        <p className="text-sm text-gray-500">Bienvenido de nuevo, Admin.</p>
      </div>

      {/* 2. Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios Totales"
          value={stats.kpi.totalUsers}
          icon={<Users size={24} />}
          trend={`+${stats.kpi.newUsers} esta semana`}
        />
        <StatCard
          title="Cursos Activos"
          value={stats.kpi.totalCourses}
          icon={<BookOpen size={24} />}
        />
        <StatCard
          title="Productos Tienda"
          value={stats.kpi.activeProducts}
          icon={<ShoppingBag size={24} />}
        />
        <StatCard
          title="Actividad (Simulada)"
          value="98%"
          icon={<Activity size={24} />}
          trend="Sistema saludable"
        />
      </div>

      {/* 3. Gráficos (Lazy Loaded) */}
      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts stats={stats} />
      </Suspense>

    </div>
  );
}