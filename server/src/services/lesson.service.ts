import { Lesson, Exercise, UserProgress, User, Unit } from '../models';
import AppError from '../utils/AppError';
import { lifeService } from './life.service';
import { userService } from './user.service';
import { rewardService } from './reward.service';
import { GAME_CONFIG } from '../config/game.config';

export class LessonService {

  // 1. Obtener Teoría y Ejercicios (Igual)
  async getLessonContent(lessonId: number) {
    const lesson = await Lesson.findByPk(lessonId, {
      attributes: ['id', 'title', 'theory_content', 'xp_reward']
    });

    if (!lesson) throw new AppError('Lección no encontrada', 404);

    const exercises = await Exercise.findAll({
      where: { lesson_id: lessonId },
      order: [['difficulty', 'ASC'], ['id', 'ASC']],
      attributes: ['id', 'type', 'prompt', 'options', 'correct_answer', 'solution_explanation', 'difficulty']
    });

    return { lesson, exercises };
  }

  // 2. Completar Lección (CORREGIDO)
  async completeLesson(userId: number, lessonId: number, stars: number, remainingLives: number) {

    // a) Validar lección
    const currentLesson = await Lesson.findByPk(lessonId);
    if (!currentLesson) throw new AppError('Lección inválida', 404);

    // b) Actualizar/Crear Progreso
    let progress = await UserProgress.findOne({
      where: { user_id: userId, lesson_id: lessonId }
    });

    const isReplay = progress && progress.status === 'completed';
    // DEFINIMOS LOS VALORES BASE
    const baseXp = isReplay
      ? GAME_CONFIG.REWARDS.LESSON_REPLAY_XP
      : (currentLesson.xp_reward || GAME_CONFIG.REWARDS.LESSON_COMPLETE_XP);

    const baseGems = stars * GAME_CONFIG.REWARDS.GEMS_PER_STAR;

    if (!progress) {
      progress = await UserProgress.create({
        user_id: userId, lesson_id: lessonId, status: 'completed', stars: stars, attempts: 1
      });
    } else {
      const oldStars = progress.stars || 0;
      progress.status = 'completed';
      progress.stars = Math.max(oldStars, stars);
      progress.attempts = (progress.attempts || 0) + 1;
      await progress.save();
    }

    // c) ACTUALIZAR USUARIO (NIVELES, GEMAS, CLAN Y VIDAS) 🚀
    // -----------------------------------------------------------------------

    // 1. CÁLCULO DE BONOS (Visual y para Gemas)
    // Calculamos aquí para saber cuántas gemas dar y qué mostrar en pantalla.
    const rewardsCalc = await rewardService.calculateBonuses(userId, baseXp, baseGems);
    const finalGems = rewardsCalc.finalXaviCoins;
    const finalXpForDisplay = rewardsCalc.finalXp; // Solo para devolver al front

    // 2. PROCESAR XP (Vía UserService)
    // ⚠️ OJO: Pasamos 'baseXp'. UserService aplicará los bonos internamente y sumará al CLAN.
    const xpResult = await userService.addExperience(userId, baseXp);
    const user = xpResult.user;

    // 3. PROCESAR GEMAS (Manual)
    // UserService no gestiona gemas de lecciones, así que las sumamos aquí.
    user.gems += finalGems;
    await user.save();

    // 4. Gestionar Vidas (LifeService)
    if (!xpResult.leveledUp) {
      if (remainingLives < user.lives) {
        const lostAmount = user.lives - remainingLives;
        await lifeService.loseLife(user, lostAmount);
      } else {
        // Sincronización defensiva
        if (user.lives !== remainingLives) {
          user.lives = remainingLives;
          await user.save();
        }
      }
    }

    // -----------------------------------------------------------------------

    // d) DESBLOQUEAR SIGUIENTE LECCIÓN (Igual)
    let nextLesson = await Lesson.findOne({
      where: { unit_id: currentLesson.unit_id, order_index: currentLesson.order_index + 1 }
    });

    if (!nextLesson) {
      const currentUnit = await Unit.findByPk(currentLesson.unit_id);
      if (currentUnit) {
        const nextUnit = await Unit.findOne({
          where: { course_id: currentUnit.course_id, order_index: currentUnit.order_index + 1 }
        });
        if (nextUnit) {
          nextLesson = await Lesson.findOne({
            where: { unit_id: nextUnit.id },
            order: [['order_index', 'ASC']]
          });
        }
      }
    }

    if (nextLesson) {
      const nextProgress = await UserProgress.findOne({
        where: { user_id: userId, lesson_id: nextLesson.id }
      });
      if (!nextProgress) {
        await UserProgress.create({
          user_id: userId, lesson_id: nextLesson.id, status: 'active', stars: 0
        });
      }
    }

    // Unificar lista de bonos para mostrar
    // (Juntamos los que reporta UserService con los que calculamos localmente)
    const allBonuses = [
      ...(rewardsCalc.appliedBonuses || []),
      ...(xpResult.rewards.bonusesApplied || [])
    ];
    // Eliminar duplicados visuales
    const uniqueBonuses = [...new Set(allBonuses)];

    return {
      xpEarned: finalXpForDisplay, // Mostramos el total real (Base x Poción)
      baseXp: baseXp,              // Mostramos la base
      gemsEarned: finalGems,
      newStars: progress.stars,    // 👈 NUEVO: Enviar el récord histórico máximo al frontend
      appliedBonuses: uniqueBonuses,

      newTotalXp: user.xp_total,
      newTotalGems: user.gems,
      newLives: user.lives,
      nextLessonId: nextLesson?.id,

      leveledUp: xpResult.leveledUp,
      levelRewards: xpResult.rewards,
      newLevel: user.level
    };
  }
}

export const lessonService = new LessonService();
