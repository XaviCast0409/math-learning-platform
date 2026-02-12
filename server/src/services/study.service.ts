import { Op } from 'sequelize';
import { Deck, Flashcard, UserFlashcardProgress, User, Unit, Course } from '../models';
import AppError from '../utils/AppError';
import { rewardService } from './reward.service';
import { userService } from './user.service';

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
  unit_id?: number;
  active?: string;
  course_id?: number;
}

export class StudyService {

  async startSession(userId: number, deckId: number, limit = 20) {
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

  async syncProgress({ userId, updates, xpToAdd, gemsToAdd }: SyncPayload) {
    const results = [];

    let realXpEarned = 0;
    let totalFinalGems = 0;
    let leveledUp = false;
    let allBonuses: string[] = [];

    // --- LÓGICA DE RECOMPENSAS ---
    if (xpToAdd > 0 || gemsToAdd > 0) {

      const initialUser = await User.findByPk(userId, { attributes: ['xp_total'] });
      const startXp = initialUser?.xp_total || 0;

      // 👇 Use instance methods
      const gemResult = await rewardService.calculateBonuses(userId, 0, gemsToAdd);
      totalFinalGems = gemResult.finalGems;

      if (gemResult.appliedBonuses) {
        allBonuses.push(...gemResult.appliedBonuses);
      }

      // 👇 Use instance methods
      const xpResult = await userService.addExperience(userId, xpToAdd);

      leveledUp = xpResult.leveledUp;
      realXpEarned = xpResult.user.xp_total - startXp;

      if (xpResult.rewards.bonusesApplied) {
        allBonuses.push(...xpResult.rewards.bonusesApplied);
      }

      if (totalFinalGems > 0) {
        const userToUpdate = xpResult.user;
        userToUpdate.gems += totalFinalGems;
        await userToUpdate.save();
      }
    }

    // --- ALGORITMO SRS ---
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
      xpEarned: realXpEarned,
      gemsEarned: totalFinalGems,
      appliedBonuses: uniqueBonuses,
      leveledUp
    };
  }

  async getAllDecks(filters: DeckFilters) {
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

    const { count, rows } = await Deck.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']],
      include: [
        {
          model: Unit,
          attributes: ['title', 'course_id'],
          where: filters.course_id ? { course_id: filters.course_id } : undefined,
          required: true,
          include: [
            { model: Course, attributes: ['title', 'img_url'] }
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

export const studyService = new StudyService();