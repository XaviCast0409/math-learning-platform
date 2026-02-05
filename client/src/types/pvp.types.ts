// src/types/pvp.types.ts

// 1. Estructura de la Liga (Espejo de pvp.config.ts)
export interface League {
  name: string;
  minElo: number;
  maxElo: number;
  icon: string;
}

// 2. Estados posibles de la partida
export type MatchStatus = 'PENDING' | 'ACTIVE' | 'FINISHED' | 'ABANDONED';

// 3. Datos del Oponente (Lo que recibimos al encontrar partida)
export interface OpponentData {
  id: number;
  username: string;
  avatar?: string; // Opcional, por si lo agregas luego
}

// 4. Estructura de una Pregunta PvP (Versión sanitizada del back)
export interface PvpQuestion {
  id: number;
  prompt: string;
  options: any; // O string[] dependiendo de cómo guardes el JSON
  difficulty: number;
}

// 5. Payload del evento "match_start"
export interface MatchStartPayload {
  matchId: number;
  questions: PvpQuestion[];
  opponent: OpponentData;
  startTime: number; // Timestamp
}

// 6. Payload del evento "match_finished"
export interface MatchFinishedPayload {
  winnerId: number | null;
  eloChange: number;
  p1Score: number;
  p2Score: number;
  newEloP1: number;
  newEloP2: number;
  rewardsDetail?: {
    winner: { xp: number; gems: number; bonuses: string[] };
    loser: { xp: number; gems: number; bonuses: string[] };
  };
}