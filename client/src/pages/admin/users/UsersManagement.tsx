import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORTANTE
import { 
  Search, UserX, UserCheck, Shield, GraduationCap, 
  KeyRound, Ban, RefreshCcw, ChevronLeft, ChevronRight,
  Eye // 👈 IMPORTANTE
} from 'lucide-react';
import { adminUsersApi } from '../../../api/admin/users.api';
import type { User } from '../../../types';
import { ChangePasswordModal } from './ChangePasswordModal';

// Components
import { Button } from '../../../components/common/Button';

export default function UsersManagement() {
  const navigate = useNavigate(); // 👈 IMPORTANTE
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Cargar Usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUsersApi.getAll({
        page,
        search: searchTerm,
        role: roleFilter
      });
      setUsers(response.data);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para recargar cuando cambian filtros o página
  useEffect(() => {
    // Debounce manual simple para búsqueda
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, roleFilter]);

  // --- ACCIONES ---

  const handleBanToggle = async (user: User) => {
    if (!confirm(`¿Estás seguro de ${user.deletedAt ? 'reactivar' : 'banear'} a ${user.username}?`)) return;

    try {
      if (user.deletedAt) {
        await adminUsersApi.unbanUser(user.id);
      } else {
        await adminUsersApi.banUser(user.id);
      }
      fetchUsers(); // Recargar lista
    } catch (error) {
      alert("Error al cambiar estado del usuario");
    }
  };

  const handlePasswordChange = async (newPass: string) => {
    if (!selectedUser) return;
    try {
      await adminUsersApi.forcePasswordChange(selectedUser.id, newPass);
      alert("Contraseña actualizada correctamente");
      setModalOpen(false);
    } catch (error) {
      alert("Error al actualizar contraseña");
    }
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ChangePasswordModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        username={selectedUser?.username || ''}
        onSubmit={handlePasswordChange}
      />

      {/* 1. Cabecera y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500">Administra estudiantes y moderadores.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
           {/* Buscador */}
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por usuario o email..." 
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setPage(1); // Reset a pág 1 al buscar
               }}
             />
           </div>
           
           {/* Filtro Rol */}
           <select 
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
           >
             <option value="">Todos los Roles</option>
             <option value="student">Estudiantes</option>
             <option value="moderator">Moderadores</option>
             <option value="admin">Admins</option>
           </select>
        </div>
      </div>

      {/* 2. Tabla de Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full"></div></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Nivel/ELO</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.deletedAt ? 'bg-red-50/50' : ''}`}>
                  
                  {/* Usuario */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.deletedAt ? 'bg-gray-200 text-gray-500' : 'bg-brand-blue text-white'}`}>
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${user.deletedAt ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="p-4">
                    {user.role === 'admin' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 font-bold text-xs"><Shield size={12}/> Admin</span>}
                    {user.role === 'moderator' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-bold text-xs"><Shield size={12}/> Mod</span>}
                    {user.role === 'student' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold text-xs"><GraduationCap size={12}/> Estudiante</span>}
                  </td>

                  {/* Estado */}
                  <td className="p-4">
                    {user.deletedAt ? (
                       <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs"><UserX size={14}/> BANEADO</span>
                    ) : (
                       <span className="inline-flex items-center gap-1 text-green-500 font-bold text-xs"><UserCheck size={14}/> ACTIVO</span>
                    )}
                  </td>

                  {/* Stats */}
                  <td className="p-4 text-gray-500 font-mono text-xs">
                    Lvl {user.level || 1} • {user.elo_rating || '?'} ELO
                  </td>

                  {/* Acciones */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      
                      {/* 👇 BOTÓN VER PERFIL (NUEVO) 👇 */}
                      <button 
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Perfil Completo"
                      >
                        <Eye size={16} />
                      </button>

                      <button 
                        onClick={() => openPasswordModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cambiar Contraseña"
                      >
                        <KeyRound size={16} />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleBanToggle(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.deletedAt 
                              ? 'text-green-500 hover:bg-green-50 hover:text-green-700' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={user.deletedAt ? "Reactivar Usuario" : "Banear Usuario"}
                        >
                          {user.deletedAt ? <RefreshCcw size={16} /> : <Ban size={16} />}
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No se encontraron usuarios con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Paginación */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <span className="text-sm text-gray-500">
          Página <span className="font-bold text-black">{page}</span> de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-8 px-3" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Anterior
          </Button>
          <Button 
            variant="outline" 
            className="h-8 px-3" 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}