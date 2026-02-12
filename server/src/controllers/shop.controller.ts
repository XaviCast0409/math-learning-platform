import { Request, Response, NextFunction } from 'express';
import { shopService } from '../services/shop.service';
import { logService } from '../services/admin/LogService';
import AppError from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export const getShopItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const products = await shopService.getProducts();
  res.status(200).json({ status: 'success', data: { products } });
});

export const buyItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { productId } = req.body;

  if (!productId) return res.status(400).json({ status: 'fail', message: 'Falta productId' });

  const result = await shopService.buyProduct(userId, productId);

  await logService.log(userId, 'PURCHASE', `Compró ${result.product.name} por ${result.product.cost_gems} gemas`);

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: { user: result.updatedUser }
  });
});
