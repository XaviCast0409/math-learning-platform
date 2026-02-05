import { Star, Check, Lock } from 'lucide-react';
import { clsx } from 'clsx';
// import { useNavigate } from 'react-router-dom'; // ❌ ELIMINAR ESTO

interface Lesson {
  id: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
}

interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  onClick: (lesson: Lesson) => void; // 👈 NUEVO: Recibimos la función de click
}

export const LessonNode = ({ lesson, index, onClick }: LessonNodeProps) => {
  // const navigate = useNavigate(); // ❌ YA NO USAMOS NAVIGATE AQUÍ

  // Cálculo de posición en zig-zag (Sin cambios)
  const offset = Math.sin(index) * 60; 

  const getNodeStyles = () => {
    switch (lesson.status) {
      case 'completed':
        return "bg-brand-yellow border-brand-yellow text-white";
      case 'active':
        return "bg-brand-green border-brand-green text-white animate-bounce-subtle shadow-[0_0_20px_rgba(34,197,94,0.6)]";
      case 'locked':
      default:
        return "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed";
    }
  };

  return (
    <div 
      className="relative z-10 transition-transform hover:scale-110 active:scale-95"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <button
        // 👇 AHORA SOLO LLAMAMOS A LA FUNCIÓN DEL PADRE
        onClick={() => onClick(lesson)} 
        
        className={clsx(
          "w-20 h-20 rounded-full border-b-8 flex items-center justify-center relative",
          getNodeStyles()
        )}
      >
        {lesson.status === 'completed' && <Check size={40} strokeWidth={4} />}
        {lesson.status === 'active' && <Star size={40} fill="currentColor" />}
        {lesson.status === 'locked' && <Lock size={32} />}
        
        {/* Reflejo decorativo (Brillo) */}
        <div className="absolute top-2 right-3 w-4 h-2 bg-white/40 rounded-full rotate-45"></div>
      </button>

      {/* Etiqueta flotante (Tooltip simple) */}
      {lesson.status === 'active' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg border-2 border-black font-bold text-xs whitespace-nowrap shadow-sm">
          EMPEZAR
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
        </div>
      )}
    </div>
  );
};