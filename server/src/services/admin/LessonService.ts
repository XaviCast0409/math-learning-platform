import { Lesson } from '../../models';

export class LessonService {
  // Obtener detalle de lección (Aquí sí traemos los ejercicios)
  static async getByIdWithExercises(id: number) {
    return await Lesson.findByPk(id, {
      include: ['exercises'] // Usa el alias definido en index.ts
    });
  }

  static async create(data: any) {
    return await Lesson.create(data);
  }

  static async update(id: number, data: any) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new Error('Lección no encontrada');
    return await lesson.update(data);
  }

  static async delete(id: number) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new Error('Lección no encontrada');
    await lesson.destroy();
    return { message: 'Lección eliminada' };
  }
}