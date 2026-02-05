import { useState, useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 30000; // 30 segundos de inactividad permitida

export const useActivity = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // 1. Detectar cambio de pestaña (Alt-Tab)
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsTabHidden(hidden);
      if (!hidden) lastActivityRef.current = Date.now(); // Reset al volver
    };

    // 2. Detectar movimiento (Mouse/Teclado)
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      if (isIdle) setIsIdle(false); // Reactivar si estaba inactivo
    };

    // Eventos a escuchar
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    // 3. Intervalo para chequear inactividad (AFK)
    const checkIdleInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > IDLE_TIMEOUT) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      clearInterval(checkIdleInterval);
    };
  }, [isIdle]);

  // El usuario está "activo" solo si NO está Idle y NO tiene la pestaña oculta
  const isActive = !isIdle && !isTabHidden;

  return { isActive, isIdle, isTabHidden };
};