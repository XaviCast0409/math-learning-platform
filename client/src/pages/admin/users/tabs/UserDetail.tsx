import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  User as  Mail, Calendar } from 'lucide-react';
import { adminUsersApi } from '../../../../api/admin/users.api';
import type { User } from '../../../../types/index';

// Tabs
import { AcademicTab } from './AcademicTab';
import { InventoryTab } from './InventoryTab';
import { LogServiceTab } from './LogServiceTab';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'inventory' | 'logs'>('academic');

  useEffect(() => {
    if(id) {
        adminUsersApi.getById(Number(id)).then(setUser).catch(() => alert("Usuario no encontrado"));
    }
  }, [id]);

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
       
       {/* 1. HEADER PERFIL */}
       <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-gray-700">
                  {user.username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 mb-2">
                  <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-gray-800">{user.username}</h1>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {user.role}
                      </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> Registrado: {new Date().toLocaleDateString()}</span> {/* Ajustar con createdAt real */}
                  </div>
              </div>

              <div className="flex gap-2">
                 <button onClick={() => navigate('/admin/users')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-600 transition-colors">
                    Volver
                 </button>
              </div>
          </div>
       </div>

       {/* 2. NAVEGACIÓN TABS */}
       <div className="flex border-b border-gray-200">
           {[
               { id: 'academic', label: 'Historial Académico' },
               { id: 'inventory', label: 'Inventario & Ítems' },
               { id: 'logs', label: 'Log de Actividad' }
           ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
               >
                   {tab.label}
               </button>
           ))}
       </div>

       {/* 3. CONTENIDO DINÁMICO */}
       <div className="min-h-[300px]">
           {activeTab === 'academic' && <AcademicTab userId={user.id} />}
           {activeTab === 'inventory' && <InventoryTab userId={user.id} />}
           {activeTab === 'logs' && <LogServiceTab userId={user.id} />}
       </div>
    </div>
  );
}