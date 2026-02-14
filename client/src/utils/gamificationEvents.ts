export type LevelUpPayload = {
    level: number; // For backward compatibility if needed, but we prefer currentLevel
    previousLevel?: number;
    currentLevel?: number;
    rewards?: {
        gems: number;
        lives: number;
        items: string[];
    };
};

type LevelUpHandler = (payload: LevelUpPayload) => void;

class GamificationEventBus {
    private static instance: GamificationEventBus;
    private listeners: LevelUpHandler[] = [];

    private constructor() { }

    public static getInstance(): GamificationEventBus {
        if (!GamificationEventBus.instance) {
            GamificationEventBus.instance = new GamificationEventBus();
        }
        return GamificationEventBus.instance;
    }

    public subscribe(handler: LevelUpHandler): () => void {
        this.listeners.push(handler);
        return () => {
            this.listeners = this.listeners.filter(l => l !== handler);
        };
    }

    public emitLevelUp(payload: LevelUpPayload) {
        this.listeners.forEach(listener => listener(payload));
    }
}

export const gamificationEvents = GamificationEventBus.getInstance();
