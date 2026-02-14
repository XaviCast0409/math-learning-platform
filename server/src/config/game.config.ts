export const GAME_CONFIG = {
    DEFAULTS: {
        INITIAL_LIVES: 5,
        MAX_LIVES: 5,
        LIFE_REGEN_MINUTES: 30, // Tiempo de regeneración automática (si implementas cron)
    },
    REWARDS: {
        LESSON_COMPLETE_XP: 20,
        LESSON_REPLAY_XP: 5,
        GEMS_PER_STAR: 5,

        // Raids
        RAID_PARTICIPATION_XP: 1500,
        RAID_PARTICIPATION_GEMS: 150,

        // Matchmaking (PvP)
        MATCH_WIN_XP: 150,
        MATCH_WIN_GEMS: 25,
        MATCH_LOSE_XP: 15,
        MATCH_POINTS_BASE: 25, // Puntos base por respuesta correcta
    },
    RAID: {
        DURATION_MS: 20 * 60 * 1000, // 20 Minutos
        MAX_PLAYERS: 10,
        BOSS_SKILL_INTERVAL_MS: 30000, // 30 Segundos
        BOSS_SKILL_DURATION_MS: 3000,  // 3 Segundos
        QUESTIONS_LIMIT: 20,
    },
    MATCH: {
        ELO_RANGE: 500,
        QUESTIONS_COUNT: 8,
        START_DELAY_MS: 5000,  // 5 Segundos
        DURATION_MS: 300000,    // 5 Minutos
    },
    TOWER: {
        ENTRY_COST_GEMS: 250,      // Costo en gemas si no hay tickets
        ENTRY_Cost_TICKET: 1,      // Costo en tickets (siempre 1)
        INITIAL_LIVES: 3,          // Vidas con las que se empieza la torre

        // Recompensas Base (se multiplican por el piso alcanzado)
        XP_PER_FLOOR: 25,          // XP ganada por cada piso superado
        GEMS_PER_FLOOR: 5,         // Gemas ganadas por cada piso superado
        SCORE_PER_FLOOR: 25,       // Puntos para el ranking por piso

        // Configuración de Dificultad
        DIFFICULTY_TIERS: {
            EASY_MAX_FLOOR: 5,     // Hasta piso 5 salen preguntas fáciles
            MEDIUM_MAX_FLOOR: 10   // Hasta piso 10 salen preguntas medias (luego difíciles)
        }
    },
    STREAKS: {
        MILESTONES: {
            3: { xp: 150, gems: 25, message: "¡Racha de 3 días!" },
            5: { xp: 250, gems: 50, message: "¡5 días seguidos! Eres constante." },
            7: { xp: 350, gems: 75, message: "¡Una semana perfecta!" },
            10: { xp: 500, gems: 100, message: "¡10 días de aprendizaje imparable!" },
            15: { xp: 750, gems: 150, message: "¡Medio mes sin fallar!" },
            30: { xp: 1500, gems: 250, message: "¡MES PERFECTO! Eres una leyenda." },
        } as Record<number, { xp: number; gems: number; message: string }>
    }
};
