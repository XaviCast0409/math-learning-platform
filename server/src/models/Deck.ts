import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Deck extends Model {
  public id!: number;
  public unit_id!: number; // Lo vinculamos a la Unidad (ej: Unidad 1 Álgebra)
  public name!: string;    // Ej: "Propiedades de Potenciación"
  public description!: string;
  public image_url!: string; // Para que se vea bonito en el menú
  public active!: boolean;   // Por si quieres ocultar un mazo temporalmente
}

Deck.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  unit_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { sequelize, tableName: 'decks', timestamps: false });

export default Deck;