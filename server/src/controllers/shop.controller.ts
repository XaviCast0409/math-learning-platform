import { Request, Response, NextFunction } from 'express';
import { ShopService } from '../services/shop.service';
import { LogService } from '../services/admin/LogService';

export const getShopItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ShopService.getProducts();
    res.status(200).json({ status: 'success', data: { products } });
  } catch (error) {
    next(error);
  }
};

export const buyItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ status: 'fail', message: 'Falta productId' });

    const result = await ShopService.buyProduct(userId, productId);

    await LogService.log(userId, 'PURCHASE', `Compró ${result.product.name} por ${result.product.cost_gems} gemas`);

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { user: result.updatedUser }
    });
  } catch (error) {
    next(error);
  }
};