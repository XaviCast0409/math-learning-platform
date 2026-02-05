import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Match } from '../models';
import { GameLogic } from './game.logic';
import { RewardService } from './reward.service'; // Para gemas
import { UserService } from './user.service';     // Para XP y niveles

// Importar el handler de Raids
import { raidSocketHandler } from '../sockets/raid.socket';

interface QueuedPlayer {
  userId: number;
  socketId: string;
  elo: number;
  joinedAt: number;
}

interface MatchProgress {
  p1Answers: number;
  p2Answers: number;
  totalQuestions: number;
}

interface OnlineUser {
  userId: number;
  socketId: string;
  username: string;
  elo: number;
  status: 'IDLE' | 'SEARCHING' | 'PLAYING';
}

class SocketService {
  private static instance: SocketService;
  public io: Server | null = null;
  private matchmakingQueue: QueuedPlayer[] = [];
  private onlineUsers: Map<number, OnlineUser> = new Map();
  private activeMatches: Map<number, MatchProgress> = new Map();

  private constructor() { }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // 1. INICIALIZAR EL SERVIDOR (Se mantiene igual)
  public initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    console.log('🔌 Socket.io Inicializado');

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('No token provided'));
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        socket.data.userId = decoded.id;
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'username', 'elo_rating'] });
        if (!user) return next(new Error('User not found'));
        socket.data.username = user.username;
        socket.data.elo = user.elo_rating;
        next();
      } catch (err) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  // 2. MANEJAR CONEXIONES (Se mantiene igual, incluye Raids y Retos)
  private handleConnection(socket: Socket) {
    const userId = socket.data.userId;
    const username = socket.data.username;
    const elo = socket.data.elo;

    if (this.io) {
      raidSocketHandler(this.io, socket);
    }

    this.onlineUsers.set(userId, {
      userId,
      socketId: socket.id,
      username,
      elo,
      status: 'IDLE'
    });

    console.log(`🟢 ${username} conectado`);
    this.broadcastOnlineUsers();

    socket.on('join_queue', () => {
      this.updateUserStatus(userId, 'SEARCHING');
      this.addToQueue(userId, socket.id, socket.data.elo);
    });

    socket.on('leave_queue', () => {
      this.updateUserStatus(userId, 'IDLE');
      this.removeFromQueue(userId);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 ${username} desconectado`);
      this.onlineUsers.delete(userId);
      this.removeFromQueue(userId);
      this.broadcastOnlineUsers();
    });

    socket.on('challenge_player', (data: { targetUserId: number }) => {
      const targetUser = this.onlineUsers.get(data.targetUserId);
      if (!targetUser) return;
      if (targetUser.status !== 'IDLE') {
        socket.emit('challenge_declined', { message: 'El usuario ya no está disponible.' });
        return;
      }
      this.io?.to(targetUser.socketId).emit('incoming_challenge', {
        challengerId: userId,
        challengerName: username
      });
    });

    socket.on('challenge_response', (data: { targetUserId: number, accept: boolean }) => {
      const challengerUser = this.onlineUsers.get(data.targetUserId);
      if (!challengerUser) return;
      if (data.accept) {
        const p2Mock = {
          userId: userId,
          socketId: socket.id,
          elo: elo,
          joinedAt: Date.now()
        };
        this.createMatch(challengerUser.userId, challengerUser.socketId, p2Mock);
      } else {
        this.io?.to(challengerUser.socketId).emit('challenge_declined', {
          message: `${username} rechazó tu desafío.`
        });
      }
    });
  }

  private broadcastOnlineUsers() {
    const usersList = Array.from(this.onlineUsers.values());
    this.io?.emit('online_users_update', usersList);
  }

  private updateUserStatus(userId: number, status: 'IDLE' | 'SEARCHING' | 'PLAYING') {
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.status = status;
      this.onlineUsers.set(userId, user);
      this.broadcastOnlineUsers();
    }
  }

  // --- LÓGICA DE MATCHMAKING (Se mantiene igual) ---
  private addToQueue(userId: number, socketId: string, elo: number) {
    if (this.matchmakingQueue.find(p => p.userId === userId)) return;
    console.log(`🔍 Usuario ${userId} buscando partida...`);
    const opponent = this.findOpponent(elo);
    if (opponent) {
      this.createMatch(userId, socketId, opponent);
    } else {
      this.matchmakingQueue.push({ userId, socketId, elo, joinedAt: Date.now() });
      this.io?.to(socketId).emit('queue_status', { status: 'waiting' });
    }
  }

  private findOpponent(myElo: number): QueuedPlayer | null {
    const index = this.matchmakingQueue.findIndex(p => Math.abs(p.elo - myElo) <= 300);
    if (index !== -1) {
      const [opponent] = this.matchmakingQueue.splice(index, 1);
      return opponent;
    }
    return null;
  }

  private removeFromQueue(userId: number) {
    this.matchmakingQueue = this.matchmakingQueue.filter(p => p.userId !== userId);
    this.io?.to(this.onlineUsers.get(userId)?.socketId || '').emit('queue_status', { status: 'idle' });
  }

  // --- LÓGICA DE PARTIDA (CREACIÓN) (Se mantiene igual) ---
  private async createMatch(p1Id: number, p1SocketId: string, p2: QueuedPlayer) {
    console.log(`⚔️ ¡PARTIDA CREADA! ${p1Id} vs ${p2.userId}`);
    this.updateUserStatus(p1Id, 'PLAYING');
    this.updateUserStatus(p2.userId, 'PLAYING');

    const p1Socket = this.io?.sockets.sockets.get(p1SocketId);
    const p2Socket = this.io?.sockets.sockets.get(p2.socketId);

    if (p1Socket && p2Socket) {
      try {
        const fullQuestions = await GameLogic.fetchRandomQuestions(5);
        const newMatch = await Match.create({
          player1_id: p1Id,
          player2_id: p2.userId,
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
        const startTime = Date.now() + 5000;

        p1Socket.emit('match_start', {
          matchId: newMatch.id,
          questions: clientQuestions,
          opponent: { id: p2.userId, username: p2Socket.data.username },
          startTime
        });

        p2Socket.emit('match_start', {
          matchId: newMatch.id,
          questions: clientQuestions,
          opponent: { id: p1Id, username: p1Socket.data.username },
          startTime
        });

        this.setupGameListeners(p1Socket, newMatch.id, 1, roomId);
        this.setupGameListeners(p2Socket, newMatch.id, 2, roomId);

        setTimeout(() => {
          this.finishMatch(newMatch.id, roomId);
        }, 60000);

      } catch (error) {
        console.error("Error creando partida:", error);
      }
    }
  }

  // --- LÓGICA DE JUEGO (RESPUESTAS) (Se mantiene igual) ---
  private setupGameListeners(socket: Socket, matchId: number, playerNum: 1 | 2, roomId: string) {
    socket.on('submit_answer', async (data: { questionId: number, answer: string, timeTaken: number }) => {
      const currentMatch = await Match.findByPk(matchId);
      if (!currentMatch || currentMatch.status !== 'ACTIVE') return;

      const questions = currentMatch.game_data as any[];
      const isCorrect = GameLogic.checkAnswer(data.questionId, data.answer, questions);

      if (isCorrect) {
        const points = 10 + Math.max(0, 10 - Math.floor(data.timeTaken / 1000));
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
    });

    socket.on('send_emote', (data: { matchId: number, emoji: string }) => {
      if (data.matchId !== matchId) return;
      socket.to(roomId).emit('opponent_emote', {
        emoji: data.emoji
      });
    });
  }

  // --- LÓGICA DE FIN DE PARTIDA ---
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

    // Liberar usuarios
    this.updateUserStatus(match.player1_id, 'IDLE');
    this.updateUserStatus(match.player2_id, 'IDLE');

    let winnerId: number | null = null;
    let eloChange = 0;

    const baseWinXp = 70;
    const baseWinGems = 5;
    const baseLoseXp = 10;

    // Determinar ganador
    if (match.player1_score > match.player2_score) winnerId = match.player1_id;
    else if (match.player2_score > match.player1_score) winnerId = match.player2_id;

    let newEloP1 = 0;
    let newEloP2 = 0;
    // Inicializamos objetos vacíos
    let winnerRewards = { xp: 0, gems: 0, bonuses: [] as string[] };
    let loserRewards = { xp: 0, gems: 0, bonuses: [] as string[] };

    if (winnerId) {
      const p1 = await User.findByPk(match.player1_id);
      const p2 = await User.findByPk(match.player2_id);

      if (p1 && p2) {
        const winner = winnerId === p1.id ? p1 : p2;
        const loser = winnerId === p1.id ? p2 : p1;

        // ==========================================
        // 1. PROCESAR GANADOR
        // ==========================================

        // ELO
        eloChange = GameLogic.calculateEloChange(winner.elo_rating, loser.elo_rating);
        winner.elo_rating += eloChange;

        // XP REAL (Base + Pociones)
        const startWinnerXp = winner.xp_total;
        const winXpResult = await UserService.addExperience(winner.id, baseWinXp);
        const realWinnerXp = winXpResult.user.xp_total - startWinnerXp; // ✅ MEJORA: Cálculo real

        // GEMAS (Base + Clan + Items)
        const winGemsCalc = await RewardService.calculateBonuses(winner.id, 0, baseWinGems);
        winner.gems += winGemsCalc.finalGems;

        // BONOS ÚNICOS (Evitar duplicados visuales)
        const rawWinnerBonuses = [
          ...(winXpResult.rewards.bonusesApplied || []),
          ...(winGemsCalc.appliedBonuses || [])
        ];
        const uniqueWinnerBonuses = [...new Set(rawWinnerBonuses)]; // ✅ MEJORA: Set para únicos

        winnerRewards = {
          xp: realWinnerXp,
          gems: winGemsCalc.finalGems,
          bonuses: uniqueWinnerBonuses
        };

        // ==========================================
        // 2. PROCESAR PERDEDOR
        // ==========================================

        // ELO
        loser.elo_rating = Math.max(0, loser.elo_rating - eloChange);

        // XP REAL (Base + Pociones) -> ¡El perdedor también puede tener pociones!
        const startLoserXp = loser.xp_total; // ✅ MEJORA: Capturamos inicio
        const loseXpResult = await UserService.addExperience(loser.id, baseLoseXp);
        const realLoserXp = loseXpResult.user.xp_total - startLoserXp; // ✅ MEJORA: Cálculo real

        loserRewards = {
          xp: realLoserXp, // ✅ MEJORA: Usamos el real, no baseLoseXp
          gems: 0,
          bonuses: loseXpResult.rewards.bonusesApplied || []
        };

        // Guardar cambios en BD
        await winner.save();
        await loser.save();

        newEloP1 = p1.id === match.player1_id ? p1.elo_rating : p2.elo_rating;
        newEloP2 = p2.id === match.player2_id ? p2.elo_rating : p1.elo_rating;
      }
    }

    // ==========================================
    // 3. CERRAR PARTIDA
    // ==========================================
    match.status = 'FINISHED';
    match.winner_id = winnerId;
    match.elo_change = eloChange;
    match.xp_exchanged = baseWinXp;
    match.end_time = new Date();
    await match.save();

    this.activeMatches.delete(matchId);

    // Emitir resultados finales
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
  }
}

export default SocketService.getInstance();