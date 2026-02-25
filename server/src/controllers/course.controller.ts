import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import AppError from '../utils/AppError';

// Listar cursos (Home Screen)
export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await CourseService.getAllCourses();
    res.status(200).json({ status: 'success', data: courses });
  } catch (error) {
    next(error);
  }
};

// Interfaz para la respuesta con estado
interface LessonWithProgress {
  id: number;
  title: string;
  order_index: number;
  xp_reward: number;
  status: 'locked' | 'active' | 'completed';
  stars: number;
}

interface UnitWithLessons {
  id: number;
  title: string;
  order_index: number;
  description: string;
  lessons: LessonWithProgress[];
}

// Obtener el Mapa (Dashboard del Curso)
export const getCourseMap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // ID del curso
    const userId = (req as any).user.id; // ID del usuario (del token)

    // 1. Obtener la estructura del curso (Unidades y Lecciones)
    const courseStructure = await CourseService.getCourseContent(Number(id));

    if (!courseStructure) {
      return next(new AppError('Curso no encontrado', 404));
    }

    // 2. Obtener el progreso del usuario en este curso
    const userProgress = await CourseService.getUserProgressForCourse(userId, Number(id));

    // 3. "Fusionar" los datos (Lógica frontend-friendly)
    // Convertimos el array de progreso en un Mapa para búsqueda rápida: { lessonId: "completed" }
    const progressMap = new Map<number, { status: 'locked' | 'active' | 'completed', stars: number }>();
    userProgress.forEach((p: any) => {
      progressMap.set(p.lesson_id, { status: p.status, stars: p.stars });
    });

    // Transformamos la respuesta para inyectar el estado en cada lección
    const courseJSON = courseStructure.toJSON() as any;
    
    const mappedUnits: UnitWithLessons[] = (courseJSON.units || []).map((unit: any) => ({
      id: unit.id,
      title: unit.title,
      order_index: unit.order_index,
      description: unit.description,
      lessons: (unit.lessons || []).map((lesson: any) => {
        const progress = progressMap.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          order_index: lesson.order_index,
          xp_reward: lesson.xp_reward,
          status: progress ? progress.status : 'locked', // Por defecto bloqueada
          stars: progress ? progress.stars : 0
        };
      })
    }));

    // TRUCO: Si el usuario es nuevo, desbloquear la PRIMERA lección de la PRIMERA unidad
    if (mappedUnits.length > 0 && mappedUnits[0].lessons.length > 0) {
      const firstLesson = mappedUnits[0].lessons[0];
      if (firstLesson.status === 'locked') {
        firstLesson.status = 'active'; // La primera siempre debe estar disponible
      }
    }

    // Extraemos la metadata del curso (sin las unidades crudas)
    const { units, ...courseInfo } = courseJSON;

    res.status(200).json({
      status: 'success',
      data: { 
        courseInfo,
        units: mappedUnits 
      }
    });

  } catch (error) {
    next(error);
  }
};