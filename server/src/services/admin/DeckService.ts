// src/services/admin/DeckService.ts
import { Op } from 'sequelize';
import { Deck, Flashcard, Unit } from '../../models'; // Asegúrate de exportarlos en models/index.ts

export interface DeckFilters {
  page: number;
  pageSize?: number;
  search?: string;
  unit_id?: number; // Vital para filtrar por unidad
  active?: string;
}

export interface DeckListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  decks: Deck[];
}

export class DeckService {

  /**
   * Obtener Mazos (Paginado + Filtro por Unidad)
   */
  static async getAll(filters: DeckFilters): Promise<DeckListResponse> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    const whereClause: any = {};

    // 1. Filtro por Unidad (Crucial para el Dashboard)
    if (filters.unit_id) {
      whereClause.unit_id = filters.unit_id;
    }

    // 2. Buscador por nombre
    if (filters.search) {
      whereClause.name = { [Op.iLike]: `%${filters.search}%` };
    }

    // 3. Filtro Activo/Inactivo
    if (filters.active && filters.active !== 'all') {
      whereClause.active = filters.active === 'true';
    }

    const { count, rows } = await Deck.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']],
      include: [
        { model: Unit, attributes: ['title'] }, // Para saber de qué unidad es
        // Opcional: Contar flashcards (puede ser costoso si hay muchos datos)
        // { model: Flashcard, as: 'cards', attributes: ['id'] } 
      ]
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      decks: rows as any,
    };
  }

  static async getById(id: number) {
    const deck = await Deck.findByPk(id, {
      include: [{ model: Unit, attributes: ['id', 'title'] }]
    });
    if (!deck) throw new Error('Mazo no encontrado');
    return deck;
  }

  static async create(data: Partial<Deck>) {
    return await Deck.create(data);
  }

  static async update(id: number, data: Partial<Deck>) {
    const deck = await Deck.findByPk(id);
    if (!deck) throw new Error('Mazo no encontrado');
    return await deck.update(data);
  }

  /**
   * SOFT DELETE: Cambiamos 'active' a false en lugar de borrar
   * para no romper el historial de estudio de los alumnos.
   */
  static async toggleActive(id: number) {
    const deck = await Deck.findByPk(id);
    if (!deck) throw new Error('Mazo no encontrado');
    
    // Invertimos el estado actual
    return await deck.update({ active: !deck.active });
  }
}