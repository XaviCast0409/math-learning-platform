import { Request, Response } from 'express';
import { FlashcardService } from '../../services/admin/FlashcardService';

export class FlashcardController {

  // GET /admin/decks/:deckId/cards
  static async getCardsByDeck(req: Request, res: Response) {
    try {
      const { deckId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      
      const result = await FlashcardService.getByDeckId(Number(deckId), page);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createCard(req: Request, res: Response) {
    try {
      // Body: { deck_id, front, back, image_url }
      // Front y Back pueden contener LaTeX ($$ ... $$)
      const card = await FlashcardService.create(req.body);
      res.status(201).json(card);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const card = await FlashcardService.update(Number(id), req.body);
      res.json(card);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await FlashcardService.delete(Number(id));
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}