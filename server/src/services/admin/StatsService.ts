import { Op } from 'sequelize';
import sequelize from '../../config/database'; // Necesario para fn() y col()
import { User, Course, Product, Deck } from '../../models'; 

export class StatsService {

  static async getDashboardStats() {
    
    // ==========================================
    // 1. KPIs (CONTADORES INSTANTÁNEOS)
    // ==========================================
    // Estos son muy rápidos en Postgres
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const activeProducts = await Product.count({ where: { active: true } });
    const totalDecks = await Deck.count();

    // Nuevos usuarios (Últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    // ==========================================
    // 2. GRÁFICO DE CRECIMIENTO (Nativo PostgreSQL)
    // ==========================================
    // Calculamos la fecha de hace 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); 
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Consulta optimizada: Postgres agrupa y cuenta por nosotros
    const growthRaw = await User.findAll({
      attributes: [
        // Truncamos la fecha al mes: '2023-01-15' -> '2023-01-01'
        [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      // Agrupar por el mes truncado
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
      // Ordenar cronológicamente
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true // Nos devuelve datos JSON limpios, no instancias de modelo
    });

    // Formateamos para el Frontend (Recharts espera: { name: 'Ene', users: 10 })
    const growthData = (growthRaw as any[]).map((item: any) => {
      const date = new Date(item.date);
      // Convertir fecha a nombre de mes en español (ej: "Mar")
      const monthName = date.toLocaleString('es-ES', { month: 'short' });
      // Capitalizar (mar -> Mar)
      const name = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      return {
        name, 
        users: Number(item.count) // Postgres devuelve count como string a veces
      };
    });

    // ==========================================
    // 3. GRÁFICO DE CONTENIDO
    // ==========================================
    const contentData = [
      { name: 'Cursos', value: totalCourses },
      { name: 'Productos', value: activeProducts },
      { name: 'Mazos', value: totalDecks },
    ];

    return {
      kpi: {
        totalUsers,
        newUsers,
        totalCourses,
        activeProducts
      },
      charts: {
        growth: growthData,
        content: contentData
      }
    };
  }
}