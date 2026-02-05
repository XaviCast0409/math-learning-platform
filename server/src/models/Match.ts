import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Match extends Model {
  public id!: number;
  public player1_id!: number;
  public player2_id!: number;
  
  // Estado de la partida
  public status!: 'PENDING' | 'ACTIVE' | 'FINISHED' | 'ABANDONED';
  
  // Resultados
  public winner_id!: number | null; // Null si es empate o está en curso
  public player1_score!: number;    // Cuántas preguntas acertó
  public player2_score!: number;
  
  // Datos Técnicos (Seguridad)
  // Guardamos los IDs de los ejercicios que se usaron en ESTA partida
  // Así validamos que respondan a lo que se les preguntó.
  public game_data!: object; // JSONB: { questionIds: [1, 5, 20...], topic: "Algebra" }
  
  public xp_exchanged!: number;  // XP ganado por el ganador
  public elo_change!: number;    // Puntos de ranking intercambiados
  
  public start_time!: Date;
  public end_time!: Date;
}

Match.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  
  player1_id: { type: DataTypes.INTEGER, allowNull: false },
  player2_id: { type: DataTypes.INTEGER, allowNull: false },
  
  status: { 
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'FINISHED', 'ABANDONED'), 
    defaultValue: 'PENDING' 
  },

  winner_id: { type: DataTypes.INTEGER },
  
  player1_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  player2_score: { type: DataTypes.INTEGER, defaultValue: 0 },

  game_data: { type: DataTypes.JSONB, defaultValue: {} }, // 👈 CLAVE PARA SEGURIDAD

  xp_exchanged: { type: DataTypes.INTEGER, defaultValue: 0 },
  elo_change: { type: DataTypes.INTEGER, defaultValue: 0 },

  start_time: { type: DataTypes.DATE },
  end_time: { type: DataTypes.DATE },

}, { sequelize, tableName: 'matches', timestamps: true });

export default Match;