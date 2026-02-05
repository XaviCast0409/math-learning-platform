import { Request, Response } from 'express';
import { CourseService } from '../../services/admin/CourseService';
import { LogService } from '../../services/admin/LogService'

export class CourseController {

  /**
   * GET /admin/courses
   * Obtiene la lista paginada y filtrada para el Dashboard
   */
  static async getCourses(req: Request, res: Response) {
    try {
      // Parsear query params (vienen como string)
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const title = req.query.title as string;
      const level = req.query.level as string;

      const result = await CourseService.getAllCourses(page, pageSize, { title, level });
      res.json(result);
    } catch (error: any) {
      console.error('Error getting courses:', error);
      res.status(500).json({ message: 'Error interno al obtener cursos' });
    }
  }

  /**
   * GET /admin/courses/:id/structure
   * Obtiene el curso con todas sus unidades y lecciones (Tree View)
   */
  static async getCourseDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseStructure(Number(id));
      res.json(course);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * POST /admin/courses
   */
  static async createCourse(req: Request, res: Response) {
    try {
      // Aquí podrías usar express-validator para validar req.body
      const newCourse = await CourseService.createCourse(req.body);
      const adminId = (req as any).user.id;
      // 👇 Log
      await LogService.log(adminId, 'COURSE_CREATE', `Creó curso: ${newCourse.title}`, req.ip);
      res.status(201).json(newCourse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * PUT /admin/courses/:id
   */
  static async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedCourse = await CourseService.updateCourse(Number(id), req.body);
      const adminId = (req as any).user.id;
      await LogService.log(adminId, 'COURSE_UPDATE', `Actualizó curso ID ${id}`, req.ip);
      res.json(updatedCourse);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * DELETE /admin/courses/:id
   * Soft delete (deshabilitar)
   */
  static async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CourseService.deleteCourse(Number(id));
      const adminId = (req as any).user.id;
      await LogService.log(adminId, 'COURSE_DELETE', `Eliminó curso ID ${id}`, req.ip);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * POST /admin/courses/:id/restore
   * Restaurar curso eliminado
   */
  static async restoreCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CourseService.restoreCourse(Number(id));
      res.json({ message: 'Curso restaurado exitosamente' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}