import { Server, Socket } from 'socket.io';
import { RaidBoss, User } from '../models'; 
import { RaidService } from '../services/raid.service';

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

// Almacén en memoria: { raidId: Estado }
const activeRaidsMemory: Record<number, RaidState> = {};

const MAX_RAID_PLAYERS = 15;
const RAID_DURATION_MS = 20 * 60 * 1000; // 20 Minutos

export const raidSocketHandler = (io: Server, socket: Socket) => {

  // 1. UNIRSE A LA RAID
  socket.on('raid_join', async ({ raidId, userId }) => {
    try {
      const roomName = `raid_${raidId}`;

      // A. Validación de Cupo
      const room = io.sockets.adapter.rooms.get(roomName);
      if (room && room.size >= MAX_RAID_PLAYERS) {
        socket.emit('raid_error', { message: 'La sala está llena (Máx 15).' });
        return;
      }

      // B. Buscar Boss en BD
      const boss = await RaidBoss.findByPk(raidId);
      if (!boss || boss.status !== 'active') {
        socket.emit('raid_error', { message: 'Raid no disponible o inactiva.' });
        return;
      }

      socket.join(roomName);

      // Buscar info del usuario para el ranking y visualización
      const user = await User.findByPk(userId);
      const username = user?.username || `Héroe ${userId}`;

      // C. INICIALIZAR MEMORIA Y TIMER (Si es el primero en entrar)
      if (!activeRaidsMemory[raidId]) {
        console.log(`⚡ Iniciando Raid #${raidId} en memoria.`);

        const endTime = Date.now() + RAID_DURATION_MS;

        // Timer de Derrota Automática
        const timeoutId = setTimeout(() => {
          console.log(`⏰ Tiempo agotado para Raid #${raidId}`);
          io.to(roomName).emit('raid_timeout', { message: '¡El tiempo se ha agotado!' });
          
          // Limpieza
          if (activeRaidsMemory[raidId]?.skillIntervalId) {
             clearInterval(activeRaidsMemory[raidId].skillIntervalId!);
          }
          delete activeRaidsMemory[raidId];
          io.in(roomName).socketsLeave(roomName); 
        }, RAID_DURATION_MS);

        // IA DEL BOSS (Ataques cada 30s)
        const skillIntervalId = setInterval(() => {
          const skills = ['blind', 'silence', 'shuffle'];
          const randomSkill = skills[Math.floor(Math.random() * skills.length)];

          io.to(roomName).emit('raid_boss_skill', {
            skill: randomSkill,
            duration: 3000
          });
        }, 30000);

        activeRaidsMemory[raidId] = {
          currentHp: boss.current_hp,
          endTime,
          timeoutId,
          skillIntervalId,
          participants: {}
        };
      }

      // Registrar usuario en memoria
      if (!activeRaidsMemory[raidId].participants[userId]) {
        activeRaidsMemory[raidId].participants[userId] = {
          username,
          totalDamage: 0
        };
      }

      const raidState = activeRaidsMemory[raidId];

      // D. ENVIAR ESTADO INICIAL
      const initialQuestions = await RaidService.getRaidQuestions(20, []);

      socket.emit('raid_init', {
        bossName: boss.name,
        totalHp: boss.total_hp,
        currentHp: raidState.currentHp,
        image: boss.image_url,
        endTime: raidState.endTime,
        questions: initialQuestions
      });

    } catch (error) {
      console.error("Error en raid_join:", error);
    }
  });

  // 2. RECIBIR DAÑO
  socket.on('raid_submit_damage', async ({ raidId, userId, damage }) => {
    const roomName = `raid_${raidId}`;
    const raidState = activeRaidsMemory[raidId];

    if (!raidState) return;
    if (Date.now() > raidState.endTime) {
      socket.emit('raid_timeout', { message: 'Tiempo agotado' });
      return;
    }

    // Cálculo de vida
    let newHp = raidState.currentHp - damage;
    if (newHp < 0) newHp = 0;

    activeRaidsMemory[raidId].currentHp = newHp;

    // Actualizar Ranking
    if (raidState.participants[userId]) {
      raidState.participants[userId].totalDamage += damage;
    }

    const sortedParticipants = Object.values(raidState.participants)
      .sort((a, b) => b.totalDamage - a.totalDamage)
      .slice(0, 3);

    io.to(roomName).emit('raid_hp_update', {
      newHp,
      damageDealt: damage,
      attackerId: userId,
      leaderboard: sortedParticipants
    });

    RaidService.attackBoss(userId, damage).catch(err => console.error(err));

    // 3. VICTORIA
    if (newHp <= 0) {
      const mvpUser = Object.values(raidState.participants)
        .sort((a, b) => b.totalDamage - a.totalDamage)[0];

      // A. OBTENER IDs PARA PREMIAR
      const participantIds = Object.keys(raidState.participants).map(Number);

      // B. DAR RECOMPENSAS (Llamada al servicio)
      // NOTA: Internamente 'grantRaidRewards' debe llamar a 'UserService.addExperience'
      // para asegurar que el Clan también reciba su parte.
      const rewardsResult = await RaidService.grantRaidRewards(participantIds);

      // C. EMITIR VICTORIA
      // Enviamos 'rewardsResult' que debería contener la XP BASE y Gemas BASE para mostrar en UI.
      // (Cada usuario habrá recibido internamente sus bonos extra gracias a UserService).
      io.to(roomName).emit('raid_victory', {
        message: '¡BOSS DERROTADO!',
        mvp: mvpUser,
        rewards: rewardsResult || { xp: 500, gems: 50 } 
      });

      // Limpieza
      if (raidState.timeoutId) clearTimeout(raidState.timeoutId);
      if (raidState.skillIntervalId) clearInterval(raidState.skillIntervalId);
      delete activeRaidsMemory[raidId];
    }
  });

  // 3. RECARGAR MUNICIÓN
  socket.on('raid_fetch_more_questions', async ({ userId, existingQuestionIds }) => {
    try {
      const moreQuestions = await RaidService.getRaidQuestions(20, existingQuestionIds || []);
      if (moreQuestions.length > 0) {
        socket.emit('raid_more_questions', { questions: moreQuestions });
      }
    } catch (error) {
      console.error("Error fetching more questions:", error);
    }
  });

  // 4. SALIR DE LA SALA
  socket.on('raid_leave', ({ raidId }) => {
    const roomName = `raid_${raidId}`;
    socket.leave(roomName);
  });
};