import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../../common/Button';

interface SummaryData {
  xpEarned: number;
  gemsEarned: number;
  bonuses: string[];
}

interface Props {
  summary: SummaryData | null;
  onClose: () => void;
}

export const SessionSummaryModal = ({ summary, onClose }: Props) => {
  if (!summary) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <CheckCircle size={48} />
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-2">¡Sesión Completada!</h2>
          <p className="text-gray-500 mb-6">Aquí tienes tus recompensas:</p>

          <div className="space-y-3 mb-6">
            {/* XP */}
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex justify-between items-center">
              <span className="font-bold text-yellow-700">Experiencia</span>
              <span className="font-black text-yellow-600 text-lg">+{summary.xpEarned} XP</span>
            </div>

            {/* Gemas */}
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="font-bold text-purple-700">Gemas</span>
              <span className="font-black text-purple-600 text-lg">+{summary.gemsEarned} 💎</span>
            </div>

            {/* Bonos */}
            {summary.bonuses.length > 0 && (
              <div className="space-y-1">
                {summary.bonuses.map((bonus, i) => (
                  <div key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1 justify-center">
                    <Shield size={10} /> {bonus}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full" variant="primary" icon={<ArrowRight size={18} />}>
            Continuar
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};