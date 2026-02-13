import { useEffect, useState } from 'react';
import {
   Clock,
   Shield,
   AlertTriangle,
   ShoppingBag,
   LogIn,
   Monitor,
   GraduationCap,
   Hammer
} from 'lucide-react';
import { adminUsersApi } from '../../../api/users.api';
import type { UserLog } from '../../../../../types/admin.types';

export const LogServiceTab = ({ userId }: { userId: number }) => {
   const [logs, setLogs] = useState<UserLog[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // Llamamos al endpoint que definiste en tu API
      adminUsersApi.getActivityLogs(userId)
         .then(setLogs)
         .catch(err => console.error("Error cargando logs", err))
         .finally(() => setLoading(false));
   }, [userId]);

   // Función auxiliar para elegir icono y color según la acción
   const getActionStyle = (action: string) => {
      const upperAction = action.toUpperCase();

      if (upperAction.includes('LOGIN')) return { icon: <LogIn size={18} />, color: 'text-green-600 bg-green-50 border-green-200' };
      if (upperAction.includes('ADMIN')) return { icon: <Shield size={18} />, color: 'text-red-600 bg-red-50 border-red-200' };
      if (upperAction.includes('PURCHASE') || upperAction.includes('ITEM')) return { icon: <ShoppingBag size={18} />, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      if (upperAction.includes('LESSON') || upperAction.includes('STUDY')) return { icon: <GraduationCap size={18} />, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      if (upperAction.includes('BAN')) return { icon: <Hammer size={18} />, color: 'text-orange-600 bg-orange-50 border-orange-200' };

      // Default
      return { icon: <Monitor size={18} />, color: 'text-gray-600 bg-gray-50 border-gray-200' };
   };

   if (loading) return <div className="p-8 text-center text-gray-400">Cargando historial de actividad...</div>;

   return (
      <div className="space-y-6">

         {/* 1. Header Informativo */}
         <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-start">
            <div className="mt-1 text-orange-500">
               <AlertTriangle size={20} />
            </div>
            <div>
               <h4 className="font-bold text-orange-800 text-sm">Registro de Auditoría</h4>
               <p className="text-xs text-orange-700 mt-1">
                  Este historial muestra las acciones críticas realizadas por el usuario y las intervenciones de los administradores. Los registros son inmutables.
               </p>
            </div>
         </div>

         {/* 2. Lista de Logs (Timeline) */}
         <div className="space-y-3">
            {logs.length === 0 && (
               <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                  <Clock size={40} className="mx-auto mb-2 opacity-20" />
                  No hay actividad registrada recientemente.
               </div>
            )}

            {logs.map((log) => {
               const style = getActionStyle(log.action);

               return (
                  <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center">

                     {/* Icono */}
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${style.color}`}>
                        {style.icon}
                     </div>

                     {/* Contenido */}
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h5 className="font-bold text-gray-800 text-sm">{log.action}</h5>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(log.createdAt).toLocaleString()}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                           {log.details}
                        </p>
                        {/* Si tienes IP en tu modelo ActivityLog, muéstrala aquí */}
                        {/* @ts-ignore: Si tu tipo UserLog aún no tiene ip_address, esto evita error */}
                        {log.ipAddress && (
                           <p className="text-[10px] text-gray-400 mt-1 font-mono">
                              IP: {log.ipAddress}
                           </p>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};
