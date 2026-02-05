import { Op } from 'sequelize';
import { Product } from '../../models'; // Asegúrate que exportas Product en tu index.ts

interface ProductFilters {
  search?: string;
  category?: string;
  active?: string; // 'true' | 'false' | 'all'
}

export class ProductService {

  /**
   * 1. LISTAR PRODUCTOS (Paginado + Filtros)
   */
  static async getAllProducts(page: number = 1, pageSize: number = 10, filters?: ProductFilters) {
    const offset = (page - 1) * pageSize;
    const whereClause: any = {};

    // Filtro por Nombre (Buscador)
    if (filters?.search) {
      whereClause.name = { [Op.iLike]: `%${filters.search}%` };
    }

    // Filtro por Categoría (Select: inventory, instant, cosmetic)
    if (filters?.category) {
      whereClause.category = filters.category;
    }

    // Filtro por Estado (Ver solo activos, o todos)
    if (filters?.active && filters.active !== 'all') {
      whereClause.active = filters.active === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['id', 'DESC']], // Nuevos productos primero
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      products: rows,
    };
  }

  /**
   * 2. OBTENER DETALLE
   */
  static async getById(id: number) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  /**
   * 3. CREAR PRODUCTO
   */
  static async create(data: any) {
    // data.effect_metadata debe venir como objeto JSON desde el frontend
    // Ej: { duration_minutes: 30 }
    return await Product.create(data);
  }

  /**
   * 4. ACTUALIZAR PRODUCTO
   */
  static async update(id: number, data: any) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');
    return await product.update(data);
  }

  /**
   * 5. ELIMINAR VS DESACTIVAR
   * Importante: Si un usuario ya compró este ítem, borrarlo romperá la relación en 'UserItems'.
   * Recomendamos usar 'active: false' en su lugar.
   */
  static async delete(id: number) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Producto no encontrado');

    // OPCIÓN SEGURA: Solo desactivar
    // await product.update({ active: false });
    // return { message: 'Producto desactivado (Soft Delete)' };

    // OPCIÓN DESTRUCTIVA (Solo si nadie lo ha comprado aún):
    try {
      await product.destroy();
      return { message: 'Producto eliminado permanentemente' };
    } catch (error) {
      // Si falla es por restricción de llave foránea (alguien lo compró)
      throw new Error('No se puede eliminar porque usuarios ya compraron este ítem. Desactívalo en su lugar.');
    }
  }
}