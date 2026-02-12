import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../services/admin/ProductService';
import { logService } from '../../services/admin/LogService';
import { catchAsync } from '../../utils/catchAsync';

export class ProductController {

  static getProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const active = req.query.active as string;

    const result = await ProductService.getAllProducts(page, pageSize, { search, category, active });
    res.json(result);
  });

  static getProductDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await ProductService.getById(Number(id));
    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }
    res.json(product);
  });

  static createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    /*
      Body esperado:
      {
        "name": "Poción",
        "cost_gems": 50,
        "category": "inventory",
        "type": "health_potion",
        "image_url": "...",
        "effect_metadata": { "hp": 1 }
      }
     */
    console.log(req.body);


    const product = await ProductService.create(req.body);

    console.log(product);


    const adminId = (req as any).user.id; // 👈 Asegúrate que tu middleware de auth llene esto
    // 👇 Log
    await logService.log(adminId, 'PRODUCT_CREATE', `Creó producto: ${product.name}`, req.ip || '');
    res.status(201).json(product);
  });

  static updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await ProductService.update(Number(id), req.body);
    const adminId = (req as any).user.id;
    // 👇 Log
    await logService.log(adminId, 'PRODUCT_UPDATE', `Actualizó producto ID ${id}`, req.ip || '');
    res.json(product);
  });

  static deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ProductService.delete(Number(id));
    const adminId = (req as any).user.id;
    // 👇 Log
    await logService.log(adminId, 'PRODUCT_DELETE', `Eliminó producto ID ${id}`, req.ip || '');
    res.json(result);
  });
}
