import { Op } from 'sequelize';
import { Deck, Flashcard, UserFlashcardProgress, User, Unit, Course} from '../models'; // Asegúrate de importar User
import AppError from '../utils/AppError';
import { RewardService } from './reward.service';
import { UserService } from './user.service';

interface SyncPayload {
  userId: number;
  updates: { cardId: number; quality: number }[];
  xpToAdd: number;
  gemsToAdd: number;
}

export interface DeckFilters {
  page: number;
  pageSize?: number;
  search?: string;
  unit_id?: number; // Vital para filtrar por unidad
  active?: string;
  course_id?: number;
}

export class StudyService {

  /**
   * 1. INICIAR SESIÓN (Se mantiene igual)
   */
  static async startSession(userId: number, deckId: number, limit = 20) {
    // ... (Tu código de startSession estaba perfecto, no lo tocamos) ...
    const deck = await Deck.findByPk(deckId);
    if (!deck) throw new AppError('Mazo no encontrado', 404);

    const dueCardsProgress = await UserFlashcardProgress.findAll({
      where: {
        user_id: userId,
        next_review_date: { [Op.lte]: new Date() }
      },
      include: [{
        model: Flashcard,
        where: { deck_id: deckId },
        required: true,
        attributes: ['id', 'front', 'back', 'image_url']
      }],
      limit: limit
    });

    const dueCards = dueCardsProgress.map(p => {
      const card = (p as any).Flashcard as Flashcard;
      return {
        id: card.id,
        front: card.front,
        back: card.back,
        image_url: card.image_url,
        type: 'review',
        progressId: p.id
      };
    });

    if (dueCards.length >= limit) {
      return { deckName: deck.name, cards: dueCards };
    }

    const remainingSlots = limit - dueCards.length;

    const seenCardIds = await UserFlashcardProgress.findAll({
      where: { user_id: userId },
      attributes: ['flashcard_id']
    }).then(rows => rows.map(r => r.flashcard_id));

    const newCardsRaw = await Flashcard.findAll({
      where: {
        deck_id: deckId,
        id: { [Op.notIn]: seenCardIds }
      },
      limit: remainingSlots,
      attributes: ['id', 'front', 'back', 'image_url']
    });

    const newCards = newCardsRaw.map(c => ({
      id: c.id,
      front: c.front,
      back: c.back,
      image_url: c.image_url,
      type: 'new',
      progressId: null
    }));

    const allCards = [...dueCards, ...newCards];

    return {
      deckName: deck.name,
      totalDue: dueCards.length,
      totalNew: newCards.length,
      cards: allCards
    };
  }

  /**
   * 2. SINCRONIZAR PROGRESO (Corregido para Arquitectura Clan/Reward)
   */
  static async syncProgress({ userId, updates, xpToAdd, gemsToAdd }: SyncPayload) {
    const results = [];

    // Variables de retorno
    let realXpEarned = 0; // 👈 LO CAMBIAMOS: Para guardar la ganancia real
    let totalFinalGems = 0;
    let leveledUp = false;
    let allBonuses: string[] = [];

    // --- LÓGICA DE RECOMPENSAS ---
    if (xpToAdd > 0 || gemsToAdd > 0) {

      // 1. CAPTURAR XP INICIAL (Para calcular la diferencia real tras bonos)
      // Esto es vital si UserService aplica multiplicadores internos (pociones, eventos, etc.)
      const initialUser = await User.findByPk(userId, { attributes: ['xp_total'] });
      const startXp = initialUser?.xp_total || 0;

      // 2. PROCESAR GEMAS (Manual con RewardService)
      // Calculamos bonos de clan/items para las gemas
      const gemResult = await RewardService.calculateBonuses(userId, 0, gemsToAdd);
      totalFinalGems = gemResult.finalGems;

      if (gemResult.appliedBonuses) {
        allBonuses.push(...gemResult.appliedBonuses);
      }

      // 3. PROCESAR XP (UserService)
      // UserService se encarga de sumar, subir nivel y dar XP al clan
      const xpResult = await UserService.addExperience(userId, xpToAdd);

      leveledUp = xpResult.leveledUp;

      // 4. CALCULAR XP REAL GANADA
      // Restamos lo que tiene ahora menos lo que tenía antes
      realXpEarned = xpResult.user.xp_total - startXp;

      // Recolectar bonos de XP que haya reportado UserService
      if (xpResult.rewards.bonusesApplied) {
        allBonuses.push(...xpResult.rewards.bonusesApplied);
      }

      // 5. GUARDAR GEMAS
      // UserService guarda la XP, pero nosotros guardamos las gemas de estudio aquí
      if (totalFinalGems > 0) {
        const userToUpdate = xpResult.user; // Usamos la instancia ya cargada
        userToUpdate.gems += totalFinalGems;
        await userToUpdate.save();
      }
    }

    // --- ALGORITMO SRS (Igual que antes) ---
    for (const update of updates) {
      const { cardId, quality } = update;
      let progress = await UserFlashcardProgress.findOne({ where: { user_id: userId, flashcard_id: cardId } });

      if (!progress) {
        progress = await UserFlashcardProgress.create({
          user_id: userId, flashcard_id: cardId, box: 0, interval: 0, ease_factor: 2.5, next_review_date: new Date()
        });
      }

      if (quality < 3) {
        progress.interval = 1;
        progress.box = 0;
      } else {
        if (progress.interval === 0) progress.interval = 1;
        else if (progress.interval === 1) progress.interval = 6;
        else progress.interval = Math.round(progress.interval * progress.ease_factor);
        progress.box += 1;
      }

      progress.ease_factor = progress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (progress.ease_factor < 1.3) progress.ease_factor = 1.3;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + progress.interval);
      progress.next_review_date = nextDate;

      await progress.save();
      results.push({ cardId, interval: progress.interval });
    }

    const uniqueBonuses = [...new Set(allBonuses)];

    return {
      processed: results.length,
      xpEarned: realXpEarned, // 👈 AHORA DEVOLVEMOS LA REAL (con bonos incluidos)
      gemsEarned: totalFinalGems,
      appliedBonuses: uniqueBonuses,
      leveledUp
    };
  }

public static async getAllDecks(filters: DeckFilters) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    const whereClause: any = {};

    if (filters.search) {
      whereClause.name = { [Op.iLike]: `%${filters.search}%` };
    }
    if (filters.active && filters.active !== 'all') {
      whereClause.active = filters.active === 'true';
    }
    // NOTA: No filtramos unit_id aquí si queremos filtrar por curso, 
    // el filtro de curso lo hacemos en el include.

    const { count, rows } = await Deck.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']],
      include: [
        { 
          model: Unit, 
          attributes: ['title', 'course_id'], 
          // 👇 LA MAGIA: Filtramos por curso aquí dentro
          where: filters.course_id ? { course_id: filters.course_id } : undefined,
          required: true, // Esto hace que si filtras curso, solo traiga decks de ese curso (Inner Join)
          include: [
            { model: Course, attributes: ['title', 'img_url'] } // 👇 Traemos info del curso para mostrarla
          ]
        }
      ]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      decks: rows as any,
    };
  }
}