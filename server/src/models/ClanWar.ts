import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ClanWar extends Model {
  public id!: number;
  public clan_1_id!: number;
  public clan_2_id!: number;
  public clan_1_score!: number;
  public clan_2_score!: number;
  public start_time!: Date;
  public end_time!: Date;
  public status!: 'active' | 'finished' | 'pending';
  public winner_clan_id!: number | null;
}

ClanWar.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clan_1_id: { type: DataTypes.INTEGER, allowNull: false },
  clan_2_id: { type: DataTypes.INTEGER, allowNull: false },
  clan_1_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  clan_2_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'finished', 'pending'), defaultValue: 'pending' },
  winner_clan_id: { type: DataTypes.INTEGER, allowNull: true },
}, { sequelize, tableName: 'clan_wars', timestamps: true });

export default ClanWar;