import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RaidBoss, User } from '../../models';
import { raidService } from '../raid.service';
import { GAME_CONFIG } from '../../config/game.config';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, RaidVictoryData } from '../../types/socket.types';

interface Participant {
    username: string;
    totalDamage: number;
    avatar?: string;
}

interface RaidState {
    currentHp: number;
    endTime: number;
    timeoutId?: NodeJS.Timeout;
    skillIntervalId?: NodeJS.Timeout;
    participants: Record<number, Participant>;
}

export class RaidManager {
    private static instance: RaidManager;
    // In-memory storage: { raidId: State }
    private activeRaids: Record<number, RaidState> = {};
    private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

    private constructor() { }

    public static getInstance(): RaidManager {
        if (!RaidManager.instance) {
            RaidManager.instance = new RaidManager();
        }
        return RaidManager.instance;
    }

    public setIo(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        this.io = io;
    }

    public async joinRaid(raidId: number, userId: number, socketId: string): Promise<void> {
        if (!this.io) return;
        const roomName = `raid_${raidId}`;
        const socket = this.io.sockets.sockets.get(socketId);

        try {
            // 1. Validate Capacity
            const room = this.io.sockets.adapter.rooms.get(roomName);
            if (room && room.size >= GAME_CONFIG.RAID.MAX_PLAYERS) {
                socket?.emit('raid_error', { message: `La sala está llena (Máx ${GAME_CONFIG.RAID.MAX_PLAYERS}).` });
                return;
            }

            // 2. Find Boss
            const boss = await RaidBoss.findByPk(raidId);
            if (!boss || boss.status !== 'active') {
                socket?.emit('raid_error', { message: 'Raid no disponible o inactiva.' });
                return;
            }

            socket?.join(roomName);

            // 3. User Info
            const user = await User.findByPk(userId);
            const username = user?.username || `Héroe ${userId}`;

            // 4. Initialize State if new
            if (!this.activeRaids[raidId]) {
                this.initializeRaidState(raidId, boss.total_hp, boss.current_hp, roomName);
            }

            // 5. Register Participant
            if (!this.activeRaids[raidId].participants[userId]) {
                this.activeRaids[raidId].participants[userId] = {
                    username,
                    totalDamage: 0
                };
            }

            const raidState = this.activeRaids[raidId];

            // 6. Send Initial Data
            const initialQuestions = await raidService.getRaidQuestions(GAME_CONFIG.RAID.QUESTIONS_LIMIT, []);

            socket?.emit('raid_init', {
                bossName: boss.name,
                totalHp: boss.total_hp,
                currentHp: raidState.currentHp,
                image: boss.image_url,
                endTime: raidState.endTime,
                questions: initialQuestions
            });

        } catch (error) {
            console.error("Error in joinRaid:", error);
            socket?.emit('raid_error', { message: 'Error interno al unirse a la raid.' });
        }
    }

    private initializeRaidState(raidId: number, totalHp: number, currentHp: number, roomName: string) {
        console.log(`⚡ Iniciando Raid #${raidId} en memoria.`);
        const endTime = Date.now() + GAME_CONFIG.RAID.DURATION_MS;

        // Timeout
        const timeoutId = setTimeout(() => {
            console.log(`⏰ Tiempo agotado para Raid #${raidId}`);
            this.io?.to(roomName).emit('raid_timeout', { message: '¡El tiempo se ha agotado!' });
            this.cleanupRaid(raidId, roomName);
        }, GAME_CONFIG.RAID.DURATION_MS);

        // Boss AI
        const skillIntervalId = setInterval(() => {
            const skills = ['blind', 'silence', 'shuffle'];
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];

            this.io?.to(roomName).emit('raid_boss_skill', {
                skill: randomSkill,
                duration: GAME_CONFIG.RAID.BOSS_SKILL_DURATION_MS
            });
        }, GAME_CONFIG.RAID.BOSS_SKILL_INTERVAL_MS);

        this.activeRaids[raidId] = {
            currentHp: currentHp,
            endTime,
            timeoutId,
            skillIntervalId,
            participants: {}
        };
    }

    public async processDamage(raidId: number, userId: number, damage: number) {
        if (!this.io) return;
        const roomName = `raid_${raidId}`;
        const raidState = this.activeRaids[raidId];

        if (!raidState) return;
        if (Date.now() > raidState.endTime) {
            // Could emit timeout here, but usually client handles it or the timeout callback fires
            return;
        }

        // Calc HP
        let newHp = raidState.currentHp - damage;
        if (newHp < 0) newHp = 0;
        raidState.currentHp = newHp;

        // Update Stats
        if (raidState.participants[userId]) {
            raidState.participants[userId].totalDamage += damage;
        }

        // Broadcast Update
        const sortedParticipants = Object.values(raidState.participants)
            .sort((a, b) => b.totalDamage - a.totalDamage)
            .slice(0, 3);

        this.io.to(roomName).emit('raid_hp_update', {
            newHp,
            damageDealt: damage,
            attackerId: userId,
            leaderboard: sortedParticipants
        });

        // DB Async Update
        raidService.attackBoss(userId, damage).catch(err => console.error(err));

        // Check Victory
        if (newHp <= 0) {
            await this.handleVictory(raidId, roomName, raidState);
        }
    }

    private async handleVictory(raidId: number, roomName: string, raidState: RaidState) {
        if (!this.io) return;

        const mvpUser = Object.values(raidState.participants)
            .sort((a, b) => b.totalDamage - a.totalDamage)[0];

        // IDs
        const participantIds = Object.keys(raidState.participants).map(Number);

        // Grant Rewards
        const rewardsResult = await raidService.grantRaidRewards(participantIds);

        // Emit Victory
        this.io.to(roomName).emit('raid_victory', {
            message: '¡BOSS DERROTADO!',
            mvp: mvpUser,
            rewards: rewardsResult || { xp: GAME_CONFIG.REWARDS.RAID_PARTICIPATION_XP, gems: GAME_CONFIG.REWARDS.RAID_PARTICIPATION_GEMS }
        });

        this.cleanupRaid(raidId, roomName);
    }

    private cleanupRaid(raidId: number, roomName: string) {
        const state = this.activeRaids[raidId];
        if (state) {
            if (state.timeoutId) clearTimeout(state.timeoutId);
            if (state.skillIntervalId) clearInterval(state.skillIntervalId);
            delete this.activeRaids[raidId];
        }
        // Force disconnect or just let them leave? Usually just clear state.
        // clients will leave room eventually or we can force it:
        this.io?.in(roomName).socketsLeave(roomName);
    }
}

export const raidManager = RaidManager.getInstance();
