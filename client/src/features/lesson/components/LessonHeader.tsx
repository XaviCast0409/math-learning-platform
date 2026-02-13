import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LessonHeaderProps {
  progress: number; // 0 a 100
  lives: number;
}

export const LessonHeader = ({ progress, lives }: LessonHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-white z-40 flex items-center px-4 gap-4 max-w-md mx-auto">
      {/* Botón Salir */}
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-xl">
        <X size={28} strokeWidth={3} />
      </button>

      {/* Barra de Progreso */}
      <div className="flex-1 h-5 bg-gray-200 rounded-full relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-brand-green transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          {/* Brillo decorativo en la barra */}
          <div className="absolute top-1 right-2 w-full h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Vidas */}
      <div className="flex items-center gap-1">
        <Heart className="text-brand-red fill-brand-red animate-pulse" size={28} strokeWidth={3} />
        <span className="font-black text-xl text-brand-red">{lives}</span>
      </div>
    </div>
  );
};

