import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class RaidBoss extends Model {
  public id!: number;
  public name!: string; // Ej: "Golem de Álgebra"
  public image_url!: string;
  public total_hp!: number; // Ej: 100,000
  public current_hp!: number;
  public start_time!: Date;
  public end_time!: Date;
  public status!: 'active' | 'defeated' | 'expired';
  public rewards_pool!: object; // JSON con premios (gemas, xp)
}

RaidBoss.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: true },
  total_hp: { type: DataTypes.INTEGER, allowNull: false },
  current_hp: { type: DataTypes.INTEGER, allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'defeated', 'expired'), defaultValue: 'active' },
  rewards_pool: { type: DataTypes.JSONB, defaultValue: {} }
}, { sequelize, tableName: 'raid_bosses', timestamps: true });

export default RaidBoss;