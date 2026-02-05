import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class RaidParticipation extends Model {
  public id!: number;
  public user_id!: number;
  public raid_boss_id!: number;
  public total_damage_dealt!: number; // Cuánto daño hizo este usuario
  public attacks_count!: number; // Cuántas veces participó
}

RaidParticipation.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  raid_boss_id: { type: DataTypes.INTEGER, allowNull: false },
  total_damage_dealt: { type: DataTypes.INTEGER, defaultValue: 0 },
  attacks_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, tableName: 'raid_participations', timestamps: true });

export default RaidParticipation;