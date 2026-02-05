import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Course extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public level!: 'secundaria' | 'pre_universitario' | 'universitario';
  public institution_target!: string; // Ej: 'General', 'UNI', 'San Marcos'
  public img_url!: string;
}

Course.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  level: { type: DataTypes.ENUM('secundaria', 'pre_universitario', 'universitario'), allowNull: false },
  institution_target: { type: DataTypes.STRING, defaultValue: 'General' },
  img_url: { type: DataTypes.STRING },
}, { sequelize, tableName: 'courses', timestamps: true, paranoid: true });

export default Course;