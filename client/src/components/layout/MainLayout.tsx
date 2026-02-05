import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav'; 
// Importar notificaciones de PvP
import { PvpNotificationLayer } from '../../pages/pvp/PvpNotificationLayer'; 
// 👇 IMPORTAR LA NUEVA ALERTA DE RAID
import { RaidFloatingAlert } from '../../pages/raid/components/RaidFloatingAlert';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      
      {/* 1. CAPA DE PVP (Prioridad Alta: Interrupciones) */}
      <PvpNotificationLayer />

      {/* 2. CAPA DE RAID (Prioridad Media: Botón Flotante) */}
      {/* Se mostrará en la esquina inferior derecha, encima del menú */}
      <RaidFloatingAlert />

      {/* Contenido principal */}
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm overflow-hidden">
        {children}
      </main>
      
      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
};