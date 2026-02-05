// src/services/admin/FlashcardService.ts
import { Flashcard } from '../../models';

export class FlashcardService {

  /**
   * Obtener todas las cards de un mazo (Paginado opcional)
   */
  static async getByDeckId(deckId: number, page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;
    
    const { count, rows } = await Flashcard.findAndCountAll({
      where: { deck_id: deckId },
      limit: pageSize,
      offset: offset,
      order: [['id', 'ASC']] // Orden de creación
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      flashcards: rows
    };
  }

  static async create(data: Partial<Flashcard>) {
    // data debe incluir { deck_id, front, back }
    return await Flashcard.create(data);
  }

  static async update(id: number, data: Partial<Flashcard>) {
    const card = await Flashcard.findByPk(id);
    if (!card) throw new Error('Flashcard no encontrada');
    return await card.update(data);
  }

  static async delete(id: number) {
    const card = await Flashcard.findByPk(id);
    if (!card) throw new Error('Flashcard no encontrada');
    await card.destroy();
    return { message: 'Flashcard eliminada correctamente' };
  }
}