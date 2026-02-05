import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Flashcard extends Model {
  public id!: number;
  public deck_id!: number; // Pertenece a un Mazo
  public front!: string;   // Pregunta (LaTeX/Texto)
  public back!: string;    // Respuesta
  public image_url!: string;
}

Flashcard.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  deck_id: { type: DataTypes.INTEGER, allowNull: false },
  front: { type: DataTypes.TEXT, allowNull: false },
  back: { type: DataTypes.TEXT, allowNull: false },
  image_url: { type: DataTypes.STRING }
}, { sequelize, tableName: 'flashcards', timestamps: false });

export default Flashcard;