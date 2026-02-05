import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle, EyeOff } from 'lucide-react';

interface AFKOverlayProps {
  isActive: boolean;
  isTabHidden: boolean;
}

export const AFKOverlay = ({ isActive, isTabHidden }: AFKOverlayProps) => {
  return (
    <AnimatePresence>
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white"
        >
          {isTabHidden ? (
            <>
              <EyeOff size={64} className="mb-4 opacity-80" />
              <h2 className="text-2xl font-bold">Sesión en Pausa</h2>
              <p className="text-white/80">Vuelve a la pestaña para continuar.</p>
            </>
          ) : (
            <>
              <PauseCircle size={64} className="mb-4 opacity-80 animate-pulse" />
              <h2 className="text-2xl font-bold">¿Sigues ahí?</h2>
              <p className="text-white/80">Mueve el mouse para reanudar el tiempo.</p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};