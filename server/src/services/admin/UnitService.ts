import { Unit } from '../../models';

export class UnitService {
  static async create(data: { course_id: number; title: string; order_index: number; description?: string }) {
    return await Unit.create(data);
  }

  static async update(id: number, data: Partial<Unit>) {
    const unit = await Unit.findByPk(id);
    if (!unit) throw new Error('Unidad no encontrada');
    return await unit.update(data);
  }

  static async delete(id: number) {
    const unit = await Unit.findByPk(id);
    if (!unit) throw new Error('Unidad no encontrada');
    // Al borrar la unidad, Sequelize no borra las lecciones en cascada automáticamente con paranoid.
    // Tienes dos opciones: borrar solo la unidad o borrar en cascada manualmente.
    await unit.destroy(); 
    return { message: 'Unidad eliminada' };
  }
}