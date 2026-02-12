import { Request, Response, NextFunction } from 'express';
import { FlashcardService } from '../../services/admin/FlashcardService';
import { catchAsync } from '../../utils/catchAsync';

export class FlashcardController {

  // GET /admin/decks/:deckId/cards
  static getCardsByDeck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { deckId } = req.params;
    const page = parseInt(req.query.page as string) || 1;

    const result = await FlashcardService.getByDeckId(Number(deckId), page);
    res.json(result);
  });

  static createCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Body: { deck_id, front, back, image_url }
    // Front y Back pueden contener LaTeX ($$ ... $$)
    const card = await FlashcardService.create(req.body);
    res.status(201).json(card);
  });

  static updateCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const card = await FlashcardService.update(Number(id), req.body);
    res.json(card);
  });

  static deleteCard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await FlashcardService.delete(Number(id));
    res.json(result);
  });
}
