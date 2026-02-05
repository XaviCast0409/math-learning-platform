import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Exercise extends Model {
  public id!: number;
  public lesson_id!: number;
  public type!: 'multiple_choice' | 'fill_in' | 'true_false';
  public difficulty!: 1 | 2 | 3; // 1: Facil, 3: Dificil (Para algoritmo adaptativo)
  
  public prompt!: string; // La pregunta en LaTeX/Markdown
  public options!: object; // JSONB: array de opciones distractores
  public correct_answer!: string; // La respuesta correcta
  public solution_explanation!: string; // Explicación paso a paso (LaTeX)
}

Exercise.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lesson_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('multiple_choice', 'fill_in', 'true_false'), defaultValue: 'multiple_choice' },
  difficulty: { type: DataTypes.INTEGER, defaultValue: 1 },
  
  prompt: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSONB, defaultValue: [] }, // Ej: ["x=2", "x=5", "x=0"]
  correct_answer: { type: DataTypes.STRING, allowNull: false },
  solution_explanation: { type: DataTypes.TEXT },
}, { sequelize, tableName: 'exercises', timestamps: true, paranoid: true });

export default Exercise;