import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Product } from './index';
// Opcional: Importar Product si necesitas tipos aquí, 
// pero usualmente se hace en las consultas con 'include'.

class UserItem extends Model {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public acquired_at!: Date;
  
  // LÓGICA DE USO:
  // Si category='inventory' -> is_used pasa a true cuando se consume.
  // Si category='cosmetic' -> is_used se ignora (o siempre false).
  public is_used!: boolean; 

  // LÓGICA DE EQUIPAMIENTO (AVATARES):
  // Solo aplica si el producto es 'cosmetic'.
  // Regla de Negocio: Solo un ítem equipado por 'type' de producto a la vez.
  public is_equipped!: boolean; 
  public Product?: Product;
}

UserItem.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  acquired_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_equipped: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, tableName: 'user_items', timestamps: false });

export default UserItem;