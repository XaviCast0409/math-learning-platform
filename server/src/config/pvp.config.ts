// src/config/pvp.config.ts

export interface League {
  name: string;
  minElo: number;
  maxElo: number; // Usamos Infinity para el último
  icon: string;   // Emoji o URL de imagen
}

export const PVP_LEAGUES: League[] = [
  { name: 'Pollito Calculadora', minElo: 0, maxElo: 499, icon: '🐣' },
  { name: 'Búho de Madera',      minElo: 500, maxElo: 999, icon: '🦉' },
  { name: 'Zorro de Piedra',     minElo: 1000, maxElo: 1499, icon: '🦊' },
  { name: 'León de Hierro',      minElo: 1500, maxElo: 1999, icon: '🦁' },
  { name: 'Dragón de Plata',     minElo: 2000, maxElo: 2499, icon: '🐉' },
  { name: 'Fénix Dorado',        minElo: 2500, maxElo: 2999, icon: '🦅' },
  { name: 'Titán de Diamante',   minElo: 3000, maxElo: Infinity, icon: '💎' },
];

// Función helper para saber qué liga es un usuario según su ELO
export const getLeagueFromElo = (elo: number): League => {
  const league = PVP_LEAGUES.find(l => elo >= l.minElo && elo <= l.maxElo);
  // Si por error tiene ELO negativo o muy alto, devolvemos el primero o el último
  return league || PVP_LEAGUES[0];
};

// Constantes para el cálculo de puntos (K-Factor)
export const K_FACTOR = 32; // Cuánto cambia el ELO por partida (estándar de ajedrez)