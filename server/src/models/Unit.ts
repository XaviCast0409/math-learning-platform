import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Unit extends Model {
  public id!: number;
  public course_id!: number;
  public title!: string;
  public order_index!: number; // 1, 2, 3... para controlar el orden visual
  public description!: string;
}

Unit.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  order_index: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { sequelize, tableName: 'units', timestamps: true, paranoid: true });

export default Unit;