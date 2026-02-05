import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, ShoppingBag, 
  LogOut, Shield, 
  Layers 
} from 'lucide-react';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Usuarios', path: '/admin/users' },
    { icon: BookOpen, label: 'Cursos', path: '/admin/courses' },
    { icon: ShoppingBag, label: 'Tienda', path: '/admin/products' },
    { icon: Layers, label: 'Mazos de Estudio', path: '/admin/study/decks' },    
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
             <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-black tracking-wider text-lg leading-none">XP ADMIN</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">v1.0.0</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                 {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold truncate">{user?.username}</p>
                 <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors"
           >
             <LogOut size={14} /> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>

    </div>
  );
}