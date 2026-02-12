import { Server } from 'socket.io';
import { GAME_CONFIG } from '../../config/game.config';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, OnlineUser } from '../../types/socket.types';

interface QueuedPlayer {
    userId: number;
    socketId: string;
    elo: number;
    joinedAt: number;
}

export class MatchmakingManager {
    private static instance: MatchmakingManager;
    private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;
    private queue: QueuedPlayer[] = [];
    // Reference to OnlineUsers from SocketService (or shared state)
    // For simplicity, we might need a callback to create match
    private createMatchCallback: (p1: QueuedPlayer, p2: QueuedPlayer) => void = () => { };

    private constructor() { }

    public static getInstance(): MatchmakingManager {
        if (!MatchmakingManager.instance) {
            MatchmakingManager.instance = new MatchmakingManager();
        }
        return MatchmakingManager.instance;
    }

    public setIo(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        this.io = io;
    }

    public setCreateMatchCallback(cb: (p1: QueuedPlayer, p2: QueuedPlayer) => void) {
        this.createMatchCallback = cb;
    }

    public addToQueue(userId: number, socketId: string, elo: number) {
        if (this.queue.find(p => p.userId === userId)) return;

        console.log(`🔍 Usuario ${userId} buscando partida...`);
        const player: QueuedPlayer = { userId, socketId, elo, joinedAt: Date.now() };

        const opponent = this.findOpponent(elo);
        if (opponent) {
            this.createMatchCallback(player, opponent);
        } else {
            this.queue.push(player);
            this.io?.to(socketId).emit('queue_status', { status: 'waiting' });
        }
    }

    public removeFromQueue(userId: number) {
        this.queue = this.queue.filter(p => p.userId !== userId);
        // Notify user if needed (handled by caller usually)
    }

    private findOpponent(myElo: number): QueuedPlayer | null {
        // Simple matchmaking: find someone within range
        const index = this.queue.findIndex(p => Math.abs(p.elo - myElo) <= GAME_CONFIG.MATCH.ELO_RANGE);
        if (index !== -1) {
            const [opponent] = this.queue.splice(index, 1);
            return opponent;
        }
        return null;
    }
}

export const matchmakingManager = MatchmakingManager.getInstance();
