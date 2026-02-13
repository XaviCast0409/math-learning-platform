import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User } from './index';

// --- TOWER RUN (Partida Actual) ---
export class TowerRun extends Model {
    public id!: number;
    public user_id!: number;
    public current_floor!: number;
    public lives_left!: number;
    public is_active!: boolean;
    public score!: number; // Puntos acumulados en esta run
    public difficulty_modifier!: number; // Multiplicador de dificultad
}

TowerRun.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    current_floor: { type: DataTypes.INTEGER, defaultValue: 1 },
    lives_left: { type: DataTypes.INTEGER, defaultValue: 3 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    score: { type: DataTypes.INTEGER, defaultValue: 0 },
    difficulty_modifier: { type: DataTypes.FLOAT, defaultValue: 1.0 }
}, { sequelize, tableName: 'tower_runs' });

// --- TOWER HISTORY (Historial / Leaderboard) ---
export class TowerHistory extends Model {
    public id!: number;
    public user_id!: number;
    public floor_reached!: number;
    public score_achieved!: number;
    public ended_at!: Date;

    // Relaciones
    public readonly User?: User;
}

TowerHistory.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    floor_reached: { type: DataTypes.INTEGER, allowNull: false },
    score_achieved: { type: DataTypes.INTEGER, allowNull: false },
    ended_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, tableName: 'tower_history' });

// Relaciones
TowerRun.belongsTo(User, { foreignKey: 'user_id' });
TowerHistory.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TowerHistory, { foreignKey: 'user_id' });
