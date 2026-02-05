import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class UserFlashcardProgress extends Model {
  public id!: number;
  public user_id!: number;
  public flashcard_id!: number;
  
  // Algoritmo Leitner / SuperMemo
  // box 0: Nueva, box 1: Aprendiz... box 5: Maestro
  public box!: number; 
  public next_review_date!: Date; // Cuándo le toca repasar
  public ease_factor!: number;    // Para algoritmo avanzado (opcional, default 2.5)
  public interval!: number;       // Días entre repasos
}

UserFlashcardProgress.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  flashcard_id: { type: DataTypes.INTEGER, allowNull: false },
  
  box: { type: DataTypes.INTEGER, defaultValue: 0 },
  next_review_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ease_factor: { type: DataTypes.FLOAT, defaultValue: 2.5 },
  interval: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { sequelize, tableName: 'user_flashcard_progress', timestamps: true });

export default UserFlashcardProgress;