import axiosClient from '../../../api/axiosClient';
import type { Deck, Flashcard, DeckFilters, DeckListResponse } from '../../../types/admin.types';

export const studyApi = {
  // --- MAZOS (DECKS) ---
  getAllDecks: async (filters: DeckFilters) => {
    const { data } = await axiosClient.get<DeckListResponse>('/admin/decks', { params: filters });
    return data;
  },

  getDeckById: async (id: number) => {
    const { data } = await axiosClient.get<Deck>(`/admin/decks/${id}`);
    return data;
  },

  createDeck: async (deckData: Partial<Deck>) => {
    const { data } = await axiosClient.post<Deck>('/admin/decks', deckData);
    return data;
  },

  updateDeck: async (id: number, deckData: Partial<Deck>) => {
    const { data } = await axiosClient.put<Deck>(`/admin/decks/${id}`, deckData);
    return data;
  },

  toggleDeck: async (id: number) => {
    const { data } = await axiosClient.patch(`/admin/decks/${id}/toggle`);
    return data;
  },

  // --- FLASHCARDS ---
  getCardsByDeck: async (deckId: number, page = 1) => {
    // Retorna { flashcards: [], totalItems... }
    const { data } = await axiosClient.get(`/admin/decks/${deckId}/cards`, { params: { page } });
    return data;
  },

  createCard: async (cardData: Partial<Flashcard>) => {
    const { data } = await axiosClient.post<Flashcard>('/admin/flashcards', cardData);
    return data;
  },

  updateCard: async (id: number, cardData: Partial<Flashcard>) => {
    const { data } = await axiosClient.put<Flashcard>(`/admin/flashcards/${id}`, cardData);
    return data;
  },

  deleteCard: async (id: number) => {
    return await axiosClient.delete(`/admin/flashcards/${id}`);
  }
};