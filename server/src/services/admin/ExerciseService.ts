import { Exercise } from '../../models';

export class ExerciseService {
  
  static async create(data: any) {
    // Validación manual de JSONB si es necesario
    if (data.type === 'multiple_choice' && !data.options) {
      throw new Error('Las preguntas de opción múltiple necesitan opciones');
    }
    return await Exercise.create(data);
  }

  // Actualización individual
  static async update(id: number, data: any) {
    const exercise = await Exercise.findByPk(id);
    if (!exercise) throw new Error('Ejercicio no encontrado');
    return await exercise.update(data);
  }
  
  // Borrar ejercicio
  static async delete(id: number) {
    const ex = await Exercise.findByPk(id);
    if(!ex) throw new Error('Ejercicio no encontrado');
    await ex.destroy();
  }
}