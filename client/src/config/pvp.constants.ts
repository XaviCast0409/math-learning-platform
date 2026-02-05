// src/config/pvp.constants.ts

export interface League {
  name: string;
  minElo: number;
  maxElo: number;
  icon: string;  // Ahora será la URL de la imagen
  color: string; // Color de fondo/borde para la UI
}

// Ruta base para no repetir código
const BASE_PATH = '/assets/pvpElo';

export const PVP_LEAGUES: League[] = [
  { 
    name: 'Pollito Calculadora', 
    minElo: 0, 
    maxElo: 499, 
    icon: `${BASE_PATH}/pollito.jpeg`, 
    color: 'bg-yellow-400 border-yellow-400 text-yellow-800' 
  },
  { 
    name: 'Búho de Madera',      
    minElo: 500, 
    maxElo: 999, 
    icon: `${BASE_PATH}/buho.jpeg`, 
    color: 'bg-orange-400 border-orange-400 text-orange-900' 
  },
  { 
    name: 'Zorro de Piedra',     
    minElo: 1000, 
    maxElo: 1499, 
    icon: `${BASE_PATH}/zorro.jpeg`, 
    color: 'bg-stone-400 border-stone-500 text-stone-800' 
  },
  { 
    name: 'León de Hierro',      
    minElo: 1500, 
    maxElo: 1999, 
    icon: `${BASE_PATH}/leon.jpeg`, 
    color: 'bg-slate-400 border-slate-600 text-slate-900' 
  },
  { 
    name: 'Dragón de Plata',     
    minElo: 2000, 
    maxElo: 2499, 
    icon: `${BASE_PATH}/dragon.jpeg`, 
    color: 'bg-cyan-400 border-cyan-500 text-cyan-900' 
  },
  { 
    name: 'Fénix Dorado',        
    minElo: 2500, 
    maxElo: 2999, 
    icon: `${BASE_PATH}/fenix.jpeg`, // Respetando "feniz"
    color: 'bg-amber-400 border-amber-500 text-amber-900' 
  },
  { 
    name: 'Titán de Diamante',   
    minElo: 3000, 
    maxElo: Infinity, 
    icon: `${BASE_PATH}/titan.jpeg`, 
    color: 'bg-blue-500 border-blue-600 text-white' 
  },
];

export const getLeagueInfo = (elo: number) => {
  const currentLeagueIndex = PVP_LEAGUES.findIndex(l => elo >= l.minElo && elo <= l.maxElo);
  // Si no encuentra (elo negativo por error), devuelve la primera
  const currentLeague = PVP_LEAGUES[currentLeagueIndex] || PVP_LEAGUES[0];
  const nextLeague = PVP_LEAGUES[currentLeagueIndex + 1] || null;

  return { currentLeague, nextLeague };
};