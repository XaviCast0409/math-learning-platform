import { X, Play, Star, Lock, HeartCrack } from 'lucide-react'; // Agregamos HeartCrack
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 👈 IMPORTAR AUTH
import { clsx } from 'clsx';

interface Lesson {
  id: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
  xp_reward?: number;
  stars?: number; // 👈 Agregamos stars
}

interface StartLessonModalProps {
  lesson: Lesson | null;
  onClose: () => void;
}

export const StartLessonModal = ({ lesson, onClose }: StartLessonModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 OBTENER EL USUARIO

  if (!lesson || !user) return null; // Protección si no hay user

  const isLocked = lesson.status === 'locked';
  const hasLives = user.lives > 0; // 👈 VERIFICAR VIDAS

  const handleStart = () => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">

      {/* Click fuera para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-10 border-4 border-black shadow-retro max-h-[85vh] overflow-y-auto">

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* Header Visual */}
        <div className={`h-24 rounded-2xl mb-6 flex items-center justify-center border-2 border-black ${isLocked ? 'bg-gray-200'
          : !hasLives ? 'bg-brand-red' // Color rojo si no hay vidas
            : 'bg-brand-blue'
          }`}>
          {isLocked ? (
            <Lock size={48} className="text-gray-400" />
          ) : !hasLives ? (
            <HeartCrack size={48} className="text-white animate-pulse" /> // Corazón roto
          ) : (
            <Star size={48} className="text-white fill-brand-yellow animate-pulse" />
          )}
        </div>

        {/* Título y Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black mb-2 leading-tight">
            {lesson.title}
          </h2>
          <p className="text-gray-500 font-medium">
            {isLocked
              ? "Completa la lección anterior para desbloquear esta."
              : !hasLives
                ? "¡Te quedaste sin vidas! Necesitas recargar para jugar."
                : lesson.status === 'completed'
                  ? "¡Ya completaste esta lección! Juega de nuevo para intentar conseguir las 3 estrellas o repasar."
                  : "¡Demuestra lo que sabes y gana recompensas!"
            }
          </p>
        </div>

        {/* Recompensas (Solo si está disponible) */}
        {!isLocked && hasLives && (
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* Si ya está completada, mostramos su récord de estrellas */}
            {lesson.status === 'completed' && lesson.stars !== undefined && (
              <div className="flex gap-1 justify-center bg-gray-50 px-4 py-2 rounded-2xl border-2 border-gray-100 mb-2">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    size={28}
                    className={clsx(
                      "transition-all",
                      starIdx <= lesson.stars!
                        ? "text-brand-yellow fill-brand-yellow drop-shadow-md"
                        : "text-gray-300 fill-gray-200"
                    )}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <div className="bg-yellow-50 px-4 py-2 rounded-xl border-2 border-yellow-200 text-yellow-700 font-bold flex items-center gap-2">
                <span className="text-xl">⚡</span>
                {/* Asumimos que la recompensa por replay es menor, por ejemplo, 5 XP */}
                <span>{lesson.status === 'completed' ? '5' : (lesson.xp_reward || 20)} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Acción */}
        <Button
          className="w-full"
          variant={isLocked || !hasLives ? 'secondary' : 'primary'} // Gris si no hay vidas
          disabled={isLocked || !hasLives} // 👈 BLOQUEADO SI NO HAY VIDAS
          onClick={handleStart}
          icon={(!isLocked && hasLives) ? <Play size={20} fill="currentColor" /> : undefined}
        >
          {isLocked
            ? 'BLOQUEADO'
            : !hasLives
              ? 'SIN VIDAS 💔'
              : 'EMPEZAR LECCIÓN'
          }
        </Button>

      </div>
    </div>
  );
};