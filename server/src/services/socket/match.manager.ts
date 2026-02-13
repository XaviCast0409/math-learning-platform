import { Server, Socket } from 'socket.io';
import { Match, User } from '../../models';
import { GameLogic } from '../game.logic';
import { GAME_CONFIG } from '../../config/game.config';
import { userService } from '../user.service';
import { rewardService } from '../reward.service';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, MatchResult, MatchRewardDetail } from '../../types/socket.types';

interface MatchProgress {
    p1Answers: number;
    p2Answers: number;
    totalQuestions: number;
}

export class MatchManager {
    private static instance: MatchManager;
    private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;
    private activeMatches: Map<number, MatchProgress> = new Map();

    // Callback to update user status in SocketService
    private updateUserStatus: (userId: number, status: 'IDLE' | 'SEARCHING' | 'PLAYING') => void = () => { };

    private constructor() { }

    public static getInstance(): MatchManager {
        if (!MatchManager.instance) {
            MatchManager.instance = new MatchManager();
        }
        return MatchManager.instance;
    }

    public setIo(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
        this.io = io;
    }

    public setStatusCallback(cb: (userId: number, status: 'IDLE' | 'SEARCHING' | 'PLAYING') => void) {
        this.updateUserStatus = cb;
    }

    public async createMatch(p1Id: number, p1SocketId: string, p1Name: string, p2Id: number, p2SocketId: string, p2Name: string) {
        if (!this.io) return;

        console.log(`⚔️ ¡PARTIDA CREADA! ${p1Id} vs ${p2Id}`);
        this.updateUserStatus(p1Id, 'PLAYING');
        this.updateUserStatus(p2Id, 'PLAYING');

        const p1Socket = this.io.sockets.sockets.get(p1SocketId);
        const p2Socket = this.io.sockets.sockets.get(p2SocketId);

        if (p1Socket && p2Socket) {
            try {
                const fullQuestions = await GameLogic.fetchRandomQuestions(GAME_CONFIG.MATCH.QUESTIONS_COUNT);
                const newMatch = await Match.create({
                    player1_id: p1Id,
                    player2_id: p2Id,
                    status: 'ACTIVE',
                    game_data: fullQuestions,
                    start_time: new Date(),
                    player1_score: 0,
                    player2_score: 0
                });

                const roomId = `match_${newMatch.id}`;
                p1Socket.join(roomId);
                p2Socket.join(roomId);

                this.activeMatches.set(newMatch.id, {
                    p1Answers: 0,
                    p2Answers: 0,
                    totalQuestions: fullQuestions.length
                });

                const clientQuestions = GameLogic.sanitizeForClient(fullQuestions);
                const startTime = Date.now() + GAME_CONFIG.MATCH.START_DELAY_MS;

                this.io.to(p1SocketId).emit('match_start', {
                    matchId: newMatch.id,
                    questions: clientQuestions,
                    opponent: { id: p2Id, username: p2Name },
                    startTime
                });

                this.io.to(p2SocketId).emit('match_start', {
                    matchId: newMatch.id,
                    questions: clientQuestions,
                    opponent: { id: p1Id, username: p1Name },
                    startTime
                });

                // Set timeout to force end match
                setTimeout(() => {
                    this.finishMatch(newMatch.id, roomId);
                }, GAME_CONFIG.MATCH.DURATION_MS);

            } catch (error) {
                console.error("Error creando partida:", error);
            }
        }
    }

    public async handleAnswer(matchId: number, userId: number, answer: string, timeTaken: number, socket: Socket) {
        const currentMatch = await Match.findByPk(matchId);
        if (!currentMatch || currentMatch.status !== 'ACTIVE') return;

        // Determine player number
        const playerNum = currentMatch.player1_id === userId ? 1 : 2;
        const roomId = `match_${matchId}`;

        const questions = currentMatch.game_data as any[];
        // Need questionId mapping? Assuming sequential or find by ID.
        // The simplified logic checks generic answer. 
        // Wait, the new logic needs questionID.
        // The socket event provides `questionId`. 
        // Let's assume the passed `answer` arg is string, we should really pass the whole data object or args.
        // Updated signature to match event data or retrieve logic inside.
        // Let's fix this in caller.

        // Actually, looking at previous code: GameLogic.checkAnswer(data.questionId, data.answer, questions);
        // So we need questionId here.

        // I will refactor handleAnswer to take data object
    }

    public async submitAnswer(socket: Socket, roomId: string, matchId: number, data: { questionId: number, answer: string, timeTaken: number }) {
        const currentMatch = await Match.findByPk(matchId);
        if (!currentMatch || currentMatch.status !== 'ACTIVE') return;

        const userId = socket.data.userId;
        const playerNum = currentMatch.player1_id === userId ? 1 : 2;

        const questions = currentMatch.game_data as any[];
        const isCorrect = GameLogic.checkAnswer(data.questionId, data.answer, questions);

        if (isCorrect) {
            const points = GAME_CONFIG.REWARDS.MATCH_POINTS_BASE + Math.max(0, 10 - Math.floor(data.timeTaken / 1000));
            if (playerNum === 1) currentMatch.player1_score += points;
            else currentMatch.player2_score += points;

            await currentMatch.save();

            socket.to(roomId).emit('opponent_action', {
                type: 'answer_correct',
                questionId: data.questionId,
                newScore: playerNum === 1 ? currentMatch.player1_score : currentMatch.player2_score
            });

            socket.emit('answer_result', { correct: true, points });
        } else {
            socket.emit('answer_result', { correct: false });
            socket.to(roomId).emit('opponent_action', { type: 'answer_wrong' });
        }

        this.checkMatchEnd(matchId, playerNum, roomId);
    }

    private checkMatchEnd(matchId: number, playerNum: 1 | 2, roomId: string) {
        const progress = this.activeMatches.get(matchId);
        if (!progress) return;

        if (playerNum === 1) progress.p1Answers++;
        else progress.p2Answers++;

        if (progress.p1Answers >= progress.totalQuestions && progress.p2Answers >= progress.totalQuestions) {
            this.finishMatch(matchId, roomId);
        }
    }

    public async finishMatch(matchId: number, roomId: string) {
        if (!this.activeMatches.has(matchId)) return;

        const match = await Match.findByPk(matchId);
        if (!match || match.status === 'FINISHED') return;

        // Release users
        this.updateUserStatus(match.player1_id, 'IDLE');
        this.updateUserStatus(match.player2_id, 'IDLE');

        let winnerId: number | null = null;
        let eloChange = 0;
        const baseWinXp = GAME_CONFIG.REWARDS.MATCH_WIN_XP;
        const baseWinGems = GAME_CONFIG.REWARDS.MATCH_WIN_GEMS;
        const baseLoseXp = GAME_CONFIG.REWARDS.MATCH_LOSE_XP;

        if (match.player1_score > match.player2_score) winnerId = match.player1_id;
        else if (match.player2_score > match.player1_score) winnerId = match.player2_id;

        let newEloP1 = 0;
        let newEloP2 = 0;
        let winnerRewards: MatchRewardDetail = { xp: 0, gems: 0, bonuses: [] };
        let loserRewards: MatchRewardDetail = { xp: 0, gems: 0, bonuses: [] };

        if (winnerId) {
            const p1 = await User.findByPk(match.player1_id);
            const p2 = await User.findByPk(match.player2_id);
            if (p1 && p2) {
                const winner = winnerId === p1.id ? p1 : p2;
                const loser = winnerId === p1.id ? p2 : p1;

                // 1. ELO
                eloChange = GameLogic.calculateEloChange(winner.elo_rating, loser.elo_rating);
                winner.elo_rating += eloChange;
                loser.elo_rating = Math.max(0, loser.elo_rating - eloChange);

                // 2. XP & Gems (Winner)
                const startWinnerXp = winner.xp_total;
                const winXpResult = await userService.addExperience(winner.id, baseWinXp);
                const realWinnerXp = winXpResult.user.xp_total - startWinnerXp;
                const winGemsCalc = await rewardService.calculateBonuses(winner.id, 0, baseWinGems);
                winner.gems += winGemsCalc.finalXaviCoins;
                const uniqueWinnerBonuses = [...new Set([...(winXpResult.rewards.bonusesApplied || []), ...(winGemsCalc.appliedBonuses || [])])];
                winnerRewards = { xp: realWinnerXp, gems: winGemsCalc.finalXaviCoins, bonuses: uniqueWinnerBonuses };

                // 3. XP (Loser)
                const startLoserXp = loser.xp_total;
                const loseXpResult = await userService.addExperience(loser.id, baseLoseXp);
                const realLoserXp = loseXpResult.user.xp_total - startLoserXp;
                loserRewards = { xp: realLoserXp, gems: 0, bonuses: loseXpResult.rewards.bonusesApplied || [] };

                await winner.save();
                await loser.save();

                newEloP1 = p1.id === match.player1_id ? p1.elo_rating : p2.elo_rating;
                newEloP2 = p2.id === match.player2_id ? p2.elo_rating : p1.elo_rating;
            }
        }

        match.status = 'FINISHED';
        match.winner_id = winnerId;
        match.elo_change = eloChange;
        match.xp_exchanged = baseWinXp;
        match.end_time = new Date();
        await match.save();

        this.activeMatches.delete(matchId);

        this.io?.to(roomId).emit('match_finished', {
            winnerId,
            eloChange,
            p1Score: match.player1_score,
            p2Score: match.player2_score,
            newEloP1,
            newEloP2,
            rewardsDetail: {
                winner: winnerRewards,
                loser: loserRewards
            }
        });

        // Make sockets leave room?
        this.io?.in(roomId).socketsLeave(roomId);
    }
}

export const matchManager = MatchManager.getInstance();
