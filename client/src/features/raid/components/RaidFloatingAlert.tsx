import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull } from 'lucide-react';
import { useCurrentRaid } from '../hooks/useCurrentRaid'; // El hook que creamos antes

export const RaidFloatingAlert = () => {
  const navigate = useNavigate();
  // Este hook verifica si hay raid activa sin molestar
  const { activeRaid } = useCurrentRaid();

  // Si no hay raid, no mostramos nada
  if (!activeRaid) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(`/raid/${activeRaid.id}`)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-lg border-2 border-red-400 group"
      >
        {/* Icono animado */}
        <div className="relative">
            <Skull size={20} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
        </div>

        {/* Texto que aparece solo en desktop o si hay espacio, o siempre */}
        <span className="text-xs font-black uppercase hidden sm:block">
          Raid Activa
        </span>
        
        {/* Barra de vida mini circular (Opcional, detalle visual pro) */}
        <svg className="w-6 h-6 -ml-1 transform -rotate-90 absolute top-0 left-0 opacity-20" viewBox="0 0 36 36">
           {/* Aquí podrías dibujar un círculo de progreso si quisieras */}
        </svg>
      </motion.button>
    </AnimatePresence>
  );
};