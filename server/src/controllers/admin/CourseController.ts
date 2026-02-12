import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../../services/admin/CourseService';
import { logService } from '../../services/admin/LogService';
import { catchAsync } from '../../utils/catchAsync';

export class CourseController {

  /**
   * GET /admin/courses
   * Obtiene la lista paginada y filtrada para el Dashboard
   */
  static getCourses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Parsear query params (vienen como string)
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search as string;
    const level = req.query.level as string;

    const result = await CourseService.getAllCourses(page, pageSize, { search, level });
    res.json(result);
  });

  /**
   * GET /admin/courses/:id/structure
   * Obtiene el curso con todas sus unidades y lecciones (Tree View)
   */
  static getCourseDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const course = await CourseService.getCourseStructure(Number(id));
    if (!course) {
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }
    res.json(course);
  });

  /**
   * POST /admin/courses
   */
  static createCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Aquí podrías usar express-validator para validar req.body
    const newCourse = await CourseService.createCourse(req.body);
    const adminId = (req as any).user.id;
    // 👇 Log
    await logService.log(adminId, 'COURSE_CREATE', `Creó curso: ${newCourse.title}`, req.ip || '');
    res.status(201).json(newCourse);
  });

  /**
   * PUT /admin/courses/:id
   */
  static updateCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedCourse = await CourseService.updateCourse(Number(id), req.body);
    const adminId = (req as any).user.id;
    await logService.log(adminId, 'COURSE_UPDATE', `Actualizó curso ID ${id}`, req.ip || '');
    res.json(updatedCourse);
  });

  /**
   * DELETE /admin/courses/:id
   * Soft delete (deshabilitar)
   */
  static deleteCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await CourseService.deleteCourse(Number(id));
    const adminId = (req as any).user.id;
    await logService.log(adminId, 'COURSE_DELETE', `Eliminó curso ID ${id}`, req.ip || '');
    res.json(result);
  });

  /**
   * POST /admin/courses/:id/restore
   * Restaurar curso eliminado
   */
  static restoreCourse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await CourseService.restoreCourse(Number(id));
    res.json({ message: 'Curso restaurado exitosamente' });
  });
}
