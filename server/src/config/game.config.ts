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
        RAID_PARTICIPATION_XP: 500,
        RAID_PARTICIPATION_GEMS: 50,

        // Matchmaking (PvP)
        MATCH_WIN_XP: 70,
        MATCH_WIN_GEMS: 5,
        MATCH_LOSE_XP: 10,
        MATCH_POINTS_BASE: 10, // Puntos base por respuesta correcta
    },
    RAID: {
        DURATION_MS: 20 * 60 * 1000, // 20 Minutos
        MAX_PLAYERS: 15,
        BOSS_SKILL_INTERVAL_MS: 30000, // 30 Segundos
        BOSS_SKILL_DURATION_MS: 3000,  // 3 Segundos
        QUESTIONS_LIMIT: 20,
    },
    MATCH: {
        ELO_RANGE: 300,
        QUESTIONS_COUNT: 5,
        START_DELAY_MS: 5000,  // 5 Segundos
        DURATION_MS: 60000,    // 1 Minuto
    },
    STREAKS: {
        MILESTONES: {
            3: { xp: 50, gems: 5, message: "¡Racha de 3 días!" },
            5: { xp: 100, gems: 10, message: "¡5 días seguidos! Eres constante." },
            7: { xp: 150, gems: 15, message: "¡Una semana perfecta!" },
            10: { xp: 200, gems: 20, message: "¡10 días de aprendizaje imparable!" },
            15: { xp: 300, gems: 30, message: "¡Medio mes sin fallar!" },
            30: { xp: 1000, gems: 100, message: "¡MES PERFECTO! Eres una leyenda." },
        } as Record<number, { xp: number; gems: number; message: string }>
    }
};
