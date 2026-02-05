import { Request, Response } from 'express';
import { ProductService } from '../../services/admin/ProductService';
import { LogService } from '../../services/admin/LogService'

export class ProductController {

  static async getProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const active = req.query.active as string;

      const result = await ProductService.getAllProducts(page, pageSize, { search, category, active });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProductDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(Number(id));
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
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
      await LogService.log(adminId, 'PRODUCT_CREATE', `Creó producto: ${product.name}`, req.ip);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.update(Number(id), req.body);
      const adminId = (req as any).user.id;
      // 👇 Log
      await LogService.log(adminId, 'PRODUCT_UPDATE', `Actualizó producto ID ${id}`, req.ip);
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.delete(Number(id));
      const adminId = (req as any).user.id;
      // 👇 Log
      await LogService.log(adminId, 'PRODUCT_DELETE', `Eliminó producto ID ${id}`, req.ip);
      res.json(result);
    } catch (error: any) {
      // Manejamos el error de llave foránea amigablemente
      res.status(400).json({ message: error.message });
    }
  }
}