import { Op } from 'sequelize';
import { Course, Unit, Lesson, Exercise } from '../../models'; // Importar desde tu index.ts

interface CourseFilters {
  search?: string;
  level?: string;
}

export class CourseService {

  /**
   * 1. GET ALL (PAGINADO Y FILTRADO)
   * Úsalo para la tabla principal del Admin Dashboard.
   */
  static async getAllCourses(page: number = 1, pageSize: number = 10, filters?: CourseFilters) {
    const offset = (page - 1) * pageSize;
    const whereClause: any = {};

    // Filtros dinámicos (Buscador y Dropdown de nivel)
    if (filters?.search) {
      whereClause.title = { [Op.iLike]: `%${filters.search}%` }; // Búsqueda insensible a mayúsculas
    }
    if (filters?.level) {
      whereClause.level = filters.level;
    }

    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']], // Ver los más recientes primero
      // Opcional: incluir conteo de unidades para mostrar en la tabla
      // attributes: { include: [[sequelize.fn("COUNT", sequelize.col("units.id")), "unitsCount"]] }
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      courses: rows,
    };
  }

  /**
   * 2. GET FULL STRUCTURE (Para el modo "Edición" del Admin)
   * Trae Curso -> Unidades -> Lecciones (Sin ejercicios para no explotar la memoria).
   * Los ejercicios se cargan bajo demanda al entrar a una lección.
   */
  static async getCourseStructure(courseId: number) {
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Unit,
        as: 'units',
        // 'separate: true' optimiza la consulta haciendo sub-queries en lugar de un join gigante
        separate: true,
        order: [['order_index', 'ASC']],
        include: [{
          model: Lesson,
          as: 'lessons',
          separate: true,
          order: [['order_index', 'ASC']]
        }]
      }]
    });

    if (!course) throw new Error('Curso no encontrado');
    return course;
  }

  static async createCourse(data: any) {
    return await Course.create(data);
  }

  static async updateCourse(id: number, data: any) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error('Curso no encontrado');
    return await course.update(data);
  }

  /**
   * 3. SOFT DELETE
   * Gracias a 'paranoid: true', esto no borra el registro, solo lo oculta.
   * Las relaciones NO se rompen, solo se "desactivan".
   */
  static async deleteCourse(id: number) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error('Curso no encontrado');
    await course.destroy();
    return { message: 'Curso deshabilitado correctamente' };
  }

  /**
   * 4. RESTORE (Para recuperar un curso borrado por error)
   */
  static async restoreCourse(id: number) {
    return await Course.restore({ where: { id } });
  }
}