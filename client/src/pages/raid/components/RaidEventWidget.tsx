import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Clock, Skull } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { RaidBossData } from '../../../types/raid.types';

interface Props {
  raid: RaidBossData;
}

export const RaidEventWidget = ({ raid }: Props) => {
  const navigate = useNavigate();
  
  // Calcular porcentaje de vida para la barra previa
  const hpPercent = (raid.currentHp / raid.maxHp) * 100;

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <div className="bg-gradient-to-r from-red-900 to-slate-900 rounded-2xl p-1 shadow-2xl border border-red-500/50 relative overflow-hidden group">
        
        {/* Efecto de fondo animado (Pulse) */}
        <div className="absolute inset-0 bg-red-600 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity animate-pulse" />

        <div className="bg-slate-900/90 rounded-xl p-4 relative z-10 flex items-center gap-4 backdrop-blur-sm">
          
          {/* Imagen del Boss */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-red-500 shadow-lg">
              {raid.image ? (
                <img src={raid.image} alt={raid.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-red-950 flex items-center justify-center">
                    <Skull className="text-red-500" />
                </div>
              )}
            </div>
            {/* Badge de Evento */}
            <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
              ¡EVENTO ACTIVO!
            </div>
          </div>

          {/* Info y Acción */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-lg truncate leading-tight mb-1">
              {raid.name}
            </h3>
            
            {/* Barra de vida mini */}
            <div className="w-full h-2 bg-slate-700 rounded-full mb-2 overflow-hidden">
               <div 
                 className="h-full bg-red-500" 
                 style={{ width: `${hpPercent}%` }}
               />
            </div>

            <div className="flex justify-between items-center">
               <span className="text-xs text-red-300 font-mono flex items-center gap-1">
                  <Clock size={12} /> Fin de semana
               </span>
               
               <Button 
                 variant="primary" 
                 className="h-8 text-xs bg-red-600 hover:bg-red-700 border-red-800"
                 onClick={() => navigate(`/raid/${raid.id}`)} // O la ruta que definas
                 icon={<Swords size={14} />}
               >
                 UNIRSE
               </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};