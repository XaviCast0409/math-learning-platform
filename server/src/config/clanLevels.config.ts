// src/config/clanLevels.config.ts

export interface ClanLevelData {
  level: number;
  minXp: number;
  capacity: number; // Miembros máximos
  benefits: string[]; // Texto para mostrar en el frontend
  goldMultiplier: number; // Ejemplo: 1.0 = 100%, 1.1 = 110% de oro en rewards
}

export const CLAN_LEVELS: Record<number, ClanLevelData> = {
  1: {
    level: 1,
    minXp: 0,
    capacity: 10,
    benefits: ['Creación del Clan', 'Capacidad: 10 miembros'],
    goldMultiplier: 1.0
  },
  2: {
    level: 2,
    minXp: 10000,
    capacity: 15,
    benefits: ['Capacidad aumentada a 15', '+5% gemas'],
    goldMultiplier: 1.05
  },
  3: {
    level: 3,
    minXp: 20000,
    capacity: 20,
    benefits: ['Capacidad aumentada a 20', '+10% gemas'],
    goldMultiplier: 1.05
  },
  4: {
    level: 4,
    minXp: 30000,
    capacity: 25,
    benefits: ['Capacidad aumentada a 25', '+15% gemas'],
    goldMultiplier: 1.10
  },
  5: {
    level: 5,
    minXp: 40000,
    capacity: 30,
    benefits: ['Capacidad aumentada a 30', '+20% gemas'],
    goldMultiplier: 1.15
  },
  // Puedes seguir hasta el nivel 50 si quieres...
  6: {
    level: 6,
    minXp: 50000,
    capacity: 35,
    benefits: ['Capacidad aumentada a 35', '+25% gemas'],
    goldMultiplier: 1.20
  }
};

export const MAX_CLAN_LEVEL = 6; // Ajusta esto según tu tabla