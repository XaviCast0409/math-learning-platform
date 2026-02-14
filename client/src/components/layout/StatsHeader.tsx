import { useState, useEffect, /* useRef */ } from 'react';
import { Heart, ChevronDown, Zap, Gem } from 'lucide-react'; // Importamos Zap y Gem
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import type { CourseSummary } from '../../api/course.api';

interface StatsHeaderProps {
  currentCourse?: CourseSummary;
  onOpenCourseSelector?: () => void;
}

export const StatsHeader = ({ currentCourse, onOpenCourseSelector }: StatsHeaderProps) => {
  const { user, refreshUser } = useAuth();
  const [livesTimer, setLivesTimer] = useState<string | null>(null);

  // 👇 ESTADO PARA LOS BUFFS
  const [activeBuffs, setActiveBuffs] = useState<{ xp: string | null, gem: string | null }>({ xp: null, gem: null });

  // const isUpdatingRef = useRef(false);

  // 1. EFECTO DE VIDAS (Tu lógica original mejorada)
  useEffect(() => {
    if (!user || user.lives >= 5 || !user.nextRegen) {
      setLivesTimer(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const nextRegen = new Date(user.nextRegen!).getTime();
      const diff = nextRegen - now;

      if (diff <= 0) {
        refreshUser(); // Refrescar cuando se regenera una vida
        setLivesTimer(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setLivesTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  // 👇 2. NUEVO EFECTO: CRONÓMETRO DE BUFFS (Pociones)
  useEffect(() => {
    if (!user) return;

    const checkBuffs = () => {
      const now = new Date().getTime();
      let xpTime = null;
      let gemTime = null;

      // Calcular tiempo restante XP
      if (user.xp_boost_expires_at) {
        const diff = new Date(user.xp_boost_expires_at).getTime() - now;
        if (diff > 0) {
          const m = Math.floor(diff / 60000);
          xpTime = `${m}m`; // Ej: "29m"
        }
      }

      // Calcular tiempo restante Gemas
      if (user.gem_boost_expires_at) {
        const diff = new Date(user.gem_boost_expires_at).getTime() - now;
        if (diff > 0) {
          const m = Math.floor(diff / 60000);
          gemTime = `${m}m`;
        }
      }

      setActiveBuffs({ xp: xpTime, gem: gemTime });
    };

    checkBuffs(); // Ejecutar ya
    const interval = setInterval(checkBuffs, 60000); // Revisar cada minuto
    return () => clearInterval(interval);
  }, [user]);

  // 👇 3. NUEVO: Escuchar cambios en localStorage (cuando otras pestañas/componentes actualizan)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        // Refrescar cuando localStorage cambia
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  return (
    <header className="fixed top-0 left-0 right-0 p-4 z-40 pointer-events-none">
      <div className="max-w-md mx-auto flex items-start justify-between pointer-events-auto">

        {/* --- IZQUIERDA (GEMAS + XP BUFF) --- */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="text-xl animate-bounce-subtle">💎</span>
              <span className="font-black text-lg text-brand-blue tracking-wide">
                {user?.gems ?? 0}
              </span>
            </div>

            {/* 👇 INDICADOR DE BUFF DE GEMAS */}
            {activeBuffs.gem && (
              <div className="bg-purple-100 border-2 border-purple-200 text-purple-600 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold animate-pulse">
                <Gem size={12} /> x2 ({activeBuffs.gem})
              </div>
            )}
          </div>

          {/* 👇 INDICADOR DE BUFF DE XP (Debajo de las gemas o al lado) */}
          {activeBuffs.xp && (
            <div className="bg-orange-100 border-2 border-orange-200 text-orange-600 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold animate-pulse shadow-sm">
              <Zap size={12} fill="currentColor" /> XP Doble ({activeBuffs.xp})
            </div>
          )}

          {/* Selector de Curso (Mantenlo si lo usas) */}
          {currentCourse && (
            <button
              onClick={onOpenCourseSelector}
              className="hidden md:flex mt-1 items-center gap-2 bg-black/5 px-3 py-2 rounded-xl hover:bg-black/10 transition-colors"
            >
              {currentCourse.img_url && <img src={currentCourse.img_url} className="w-5 h-5 object-contain" />}
              <span className="font-bold text-gray-600 text-sm uppercase">{currentCourse.title}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* --- DERECHA (VIDAS) --- */}
        {/* (Este bloque se mantiene igual que tu código original) */}
        <div className={clsx(
          "flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-gray-200 shadow-sm transition-all duration-300",
          livesTimer ? "pr-5" : ""
        )}>
          <Heart
            className={clsx(
              "transition-colors duration-300",
              (user?.lives || 0) === 0 ? "text-gray-400 fill-gray-200" : "text-brand-red fill-brand-red",
              livesTimer && "animate-pulse"
            )}
            size={26}
            strokeWidth={3}
          />
          <div className="flex flex-col items-start justify-center h-full">
            <span className={clsx(
              "font-black text-lg leading-none transition-all",
              (user?.lives || 0) === 0 ? "text-gray-400" : "text-brand-red"
            )}>
              {user?.lives ?? 5}
            </span>
            {livesTimer && (
              <span className="text-[10px] font-bold text-gray-500 tabular-nums -mb-1 animate-in slide-in-from-top-1">
                {livesTimer}
              </span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};