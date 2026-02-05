import { useEffect, useState } from 'react';
import { 
  Users, BookOpen, ShoppingBag, TrendingUp, Activity 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { adminStatsApi } from '../../api/admin/stats.api';
import type { DashboardStats } from '../../types/admin.types';

// Componente de Tarjeta KPI
const StatCard = ({ title, value, icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-bold uppercase mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-800">{value}</h3>
      {trend && <p className="text-xs text-green-500 font-bold mt-1 flex items-center">
        <TrendingUp size={12} className="mr-1"/> {trend}
      </p>}
    </div>
    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminStatsApi.getDashboard();
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando métricas...</div>;
  if (!stats) return <div className="p-10 text-center">Error al cargar datos</div>;

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
          icon={<Users size={24}/>} 
          trend={`+${stats.kpi.newUsers} esta semana`}
        />
        <StatCard 
          title="Cursos Activos" 
          value={stats.kpi.totalCourses} 
          icon={<BookOpen size={24}/>} 
        />
        <StatCard 
          title="Productos Tienda" 
          value={stats.kpi.activeProducts} 
          icon={<ShoppingBag size={24}/>} 
        />
        <StatCard 
          title="Actividad (Simulada)" 
          value="98%" 
          icon={<Activity size={24}/>} 
          trend="Sistema saludable"
        />
      </div>

      {/* 3. Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Principal (Ancho) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Crecimiento de Usuarios</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.growth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Secundario (Barra Lateral) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Contenido del Sistema</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.content} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}