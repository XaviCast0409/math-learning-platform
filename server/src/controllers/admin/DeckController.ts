import { Request, Response, NextFunction } from 'express';
import { DeckService } from '../../services/admin/DeckService';
import { catchAsync } from '../../utils/catchAsync';

export class DeckController {

  static getDecks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const unit_id = req.query.unit_id ? parseInt(req.query.unit_id as string) : undefined;
    const search = req.query.search as string;
    const active = req.query.active as string;

    const result = await DeckService.getAll({ page, pageSize, unit_id, search, active });
    res.json(result);
  });

  static getDeckDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deck = await DeckService.getById(Number(id));
    if (!deck) {
      res.status(404).json({ message: 'Mazo no encontrado' });
      return;
    }
    res.json(deck);
  });

  static createDeck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Body: { unit_id, name, description, image_url }
    const deck = await DeckService.create(req.body);
    res.status(201).json(deck);
  });

  static updateDeck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deck = await DeckService.update(Number(id), req.body);
    res.json(deck);
  });

  static toggleDeckStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deck = await DeckService.toggleActive(Number(id));
    res.json({ message: 'Estado del mazo actualizado', deck });
  });
}
