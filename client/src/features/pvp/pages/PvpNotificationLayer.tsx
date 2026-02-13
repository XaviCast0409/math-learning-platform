import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { Swords, X, Check } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { AnimatePresence, motion } from 'framer-motion';

export const PvpNotificationLayer = () => {
  const navigate = useNavigate();
  // 1. Necesitamos matchData para saber cuándo inicia la partida
  const { incomingChallenges, respondToChallenge, matchData } = useSocket();

  // 2. Efecto de Redirección Global
  // Si acepto el reto, el socket actualiza matchData. 
  // Al detectar matchData válido, redirigimos a la sala de juego.
  useEffect(() => {
    if (matchData && matchData.matchId) {
      navigate(`/pvp/match/${matchData.matchId}`);
    }
  }, [matchData, navigate]);

  // Si no hay retos, no renderizamos nada
  if (incomingChallenges.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {incomingChallenges.map((challenge) => (
          <motion.div
            key={challenge.challengerId}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto bg-white border-2 border-black rounded-xl shadow-retro p-4 flex flex-col gap-3"
          >
            {/* Cabecera */}
            <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-2">
              <div className="bg-red-100 p-2 rounded-full animate-bounce">
                <Swords className="text-red-600" size={20} />
              </div>
              <div>
                <h4 className="font-black text-xs uppercase text-gray-400">¡Reto PvP Entrante!</h4>
                <p className="font-bold text-lg leading-none text-gray-800">
                  {challenge.challengerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Te ha desafiado a un duelo. ¿Aceptas el reto?
            </p>

            {/* Botones */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs border-gray-300 text-gray-500 hover:bg-gray-50"
                onClick={() => respondToChallenge(challenge.challengerId, false)}
              >
                <X size={14} className="mr-1" /> Rechazar
              </Button>

              <Button
                variant="primary"
                className="flex-1 h-9 text-xs"
                onClick={() => respondToChallenge(challenge.challengerId, true)}
              >
                <Check size={14} className="mr-1" /> Aceptar
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
