import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Button } from '../../../components/common/Button'; // Tu botón existente


interface Props {
  onClose: () => void;
}

export const RaidVictoryModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl border-4 border-yellow-400"
      >
        {/* Rayos de luz de fondo (CSS trick) */}
        <div className="absolute inset-0 bg-yellow-50 z-0" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
             <Trophy size={40} className="text-yellow-600 animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 uppercase mb-2">¡Boss Derrotado!</h2>
          <p className="text-gray-500 text-sm mb-6">
            La comunidad ha vencido. ¡Gran trabajo en equipo!
          </p>
          
          <div className="bg-yellow-100 rounded-xl p-3 mb-6 border border-yellow-200">
             <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Tu recompensa</p>
             <div className="flex justify-center gap-3 font-black text-gray-800 text-lg">
                <span>+500 XP</span>
                <span>+50 Gemas</span>
             </div>
          </div>

          <Button onClick={onClose} className="w-full" variant="primary">
             Volver al Inicio
          </Button>
        </div>
      </motion.div>
    </div>
  );
};