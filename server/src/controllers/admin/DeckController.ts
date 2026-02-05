import { Request, Response } from 'express';
import { DeckService } from '../../services/admin/DeckService';

export class DeckController {

  static async getDecks(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const unit_id = req.query.unit_id ? parseInt(req.query.unit_id as string) : undefined;
      const search = req.query.search as string;
      const active = req.query.active as string;

      const result = await DeckService.getAll({ page, pageSize, unit_id, search, active });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getDeckDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deck = await DeckService.getById(Number(id));
      res.json(deck);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async createDeck(req: Request, res: Response) {
    try {
      // Body: { unit_id, name, description, image_url }
      const deck = await DeckService.create(req.body);
      res.status(201).json(deck);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateDeck(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deck = await DeckService.update(Number(id), req.body);
      res.json(deck);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async toggleDeckStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deck = await DeckService.toggleActive(Number(id));
      res.json({ message: 'Estado del mazo actualizado', deck });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}