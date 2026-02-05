// src/types/raid.types.ts (o dentro de src/types/index.ts)

export interface RaidBossData {
    id?: number;
  name: string;
  maxHp: number;
  currentHp: number;
  image: string;
}

export interface RaidQuestion {
  id: number;
  prompt: string; // HTML o Texto de la pregunta
  options: string[] | string; // Array o JSON string
  correct_answer: string;
}

export interface RaidLog {
  id: string; // Un ID único temporal (Date.now())
  message: string;
  type: 'damage' | 'info' | 'critical';
}