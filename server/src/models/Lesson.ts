import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Lesson extends Model {
  public id!: number;
  public unit_id!: number;
  public title!: string; // Ej: "Suma de Cubos"
  public order_index!: number;
  public theory_content!: string; // Markdown o HTML con LaTeX para la teoría
  public xp_reward!: number; // Cuanto XP da al terminar
}

Lesson.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  unit_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  order_index: { type: DataTypes.INTEGER, allowNull: false },
  theory_content: { type: DataTypes.TEXT }, // Aquí guardas la explicación teórica
  xp_reward: { type: DataTypes.INTEGER, defaultValue: 20 },
}, { sequelize, tableName: 'lessons', timestamps: true, paranoid: true });

export default Lesson;