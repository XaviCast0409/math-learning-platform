import { Course, Unit, Lesson, UserProgress } from '../models';

export class CourseService {
  
  // 1. Listar todos los cursos disponibles
  static async getAllCourses() {
    return await Course.findAll({
      attributes: ['id', 'title', 'img_url', 'level', 'institution_target']
    });
  }

  // 2. Traer el "Mapa" completo de un curso
  static async getCourseContent(courseId: number) {
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Unit,
          as: 'units', // Definimos este alias en models/index.ts
          attributes: ['id', 'title', 'order_index', 'description'],
          include: [
            {
              model: Lesson,
              as: 'lessons', // Alias definido en models/index.ts
              attributes: ['id', 'title', 'order_index', 'xp_reward'] // No traemos el contenido teórico aquí para no hacer pesada la carga
            }
          ]
        }
      ],
      order: [
        ['units', 'order_index', 'ASC'], // Ordenar unidades 1, 2, 3...
        ['units', 'lessons', 'order_index', 'ASC'] // Ordenar lecciones 1.1, 1.2...
      ]
    });

    return course;
  }

  // 3. (Avanzado) Traer el progreso del usuario para saber qué pintar de color
  static async getUserProgressForCourse(userId: number, courseId: number) {
    // Buscamos todas las lecciones que el usuario ha tocado
    // Hacemos un JOIN con Lesson para filtrar solo las de este curso
    const progress = await UserProgress.findAll({
      where: { user_id: userId },
      include: [{
        model: Lesson,
        as: 'lesson', // Alias singular (belongsTo)
        required: true,
        include: [{
          model: Unit,
          as: 'unit',
          where: { course_id: courseId },
          attributes: [] // No necesitamos datos de la unidad, solo para filtrar
        }]
      }]
    });

    return progress;
  }
}