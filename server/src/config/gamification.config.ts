// src/config/gamification.config.ts

export const MAX_LEVEL = 101;

// Configuración base
const BASE_XP = 1000; // XP necesaria para pasar del nivel 1 al 2
const GROWTH_FACTOR = 1.1; // 1.1 significa 10% más difícil cada nivel

/**
 * Calcula el nivel basado en la XP total acumulada.
 * Fórmula inversa de la suma geométrica.
 */
export const calculateLevelFromXP = (totalXp: number): number => {
  if (totalXp < BASE_XP) return 1;

  // Fórmula matemática para despejar n de la serie geométrica:
  // XP = BASE * ( (FACTOR^n - 1) / (FACTOR - 1) )
  // Solución aproximada para encontrar el nivel:
  const level = Math.floor(
    Math.log(1 + (totalXp * (GROWTH_FACTOR - 1)) / BASE_XP) / Math.log(GROWTH_FACTOR)
  ) + 1;

  console.log(`Calculated level ${level} from total XP ${totalXp}`);

  return Math.min(level, MAX_LEVEL);
};

/**
 * Calcula cuánta XP TOTAL se necesita para alcanzar un nivel X desde cero.
 * Fórmula de la suma de una progresión geométrica.
 */
export const calculateXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  // Suma geométrica: S_n = a * (r^n - 1) / (r - 1)
  // Nota: Ajustamos (level - 1) porque el nivel 1 empieza en 0 XP.
  const n = level - 1;
  const totalXp = BASE_XP * ( (Math.pow(GROWTH_FACTOR, n) - 1) / (GROWTH_FACTOR - 1) );
  
  return Math.floor(totalXp);
};

// Mapa de Recompensas (Igual que tenías)
export const LEVEL_REWARDS: Record<number, { gems?: number; lives?: number; item?: string }> = {
    2:  { gems: 10 },
    5:  { gems: 50, lives: 1 },
    10: { gems: 100, item: 'avatar_novice' },
    20: { gems: 200, item: 'theme_dark' },
    50: { gems: 1000, item: 'avatar_master' },
    100: { gems: 5000, item: 'golden_frame' }
};