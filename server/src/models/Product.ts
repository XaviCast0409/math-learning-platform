import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Tipos de producto (igual que antes)
export type ProductType =
  | 'life_refill' | 'xp_boost'
  | 'cosmetic_background' | 'cosmetic_aura' | 'cosmetic_mount' | 'cosmetic_skin'
  | 'cosmetic_legs' | 'cosmetic_feet' | 'cosmetic_chest' | 'cosmetic_head'
  | 'cosmetic_weapon' | 'cosmetic_shield'
  | string
  | 'cosmetic_background' | 'cosmetic_skin' | 'cosmetic_head'
  // 👇 ESTE ES EL NUEVO IMPORTANTE:
  | 'cosmetic_avatar'

// 👇 AQUÍ ESTÁ LA MAGIA: Una interfaz híbrida
export interface ProductMetadata {
  // --- PARTE VISUAL (Paper Doll) ---
  zIndex?: number;
  assetKey?: string;
  offsetY?: number;

  // --- PARTE DE JUEGO (Stats / RPG) ---
  xp_bonus?: number;
  gems_bonus?: number;
  defense?: number;
  streak_freeze?: boolean;

  // 👇 AGREGAR ESTOS TRES PARA QUE TU INVENTORY SERVICE FUNCIONE 👇
  duration_minutes?: number; // Para pociones de tiempo (xp_boost_time)
  amount?: number;           // Para pociones instantáneas (xp_boost_instant)
  hp_amount?: number;        // (Opcional) Por si usas pociones de vida con cantidad variable

  // 👇 NUEVO: DATOS PARA AVATARES COMPLETOS (Sprite Sheets) 👇
  // Estos campos son los que necesita tu componente 'AvatarSprite' del frontend
  is_animated?: boolean; // true si es sprite o gif
  sprite_type?: 'gif' | 'sprite'; // Para que el front sepa cómo renderizarlo
  frame_width?: number;  // Ancho de un cuadrito (ej: 64)
  frame_height?: number; // Alto de un cuadrito (ej: 64)
  total_frames?: number; // Cuántos pasos tiene la animación (ej: 7)
}

class Product extends Model {
  // ... (tus campos id, name, cost_gems, etc. siguen igual)
  public id!: number;
  public name!: string;
  public description!: string;
  public cost_gems!: number;
  public image_url!: string;
  public active!: boolean;
  public category!: 'instant' | 'inventory' | 'cosmetic';
  public type!: ProductType;

  // Ahora effect_metadata puede contener TODO junto
  public effect_metadata!: ProductMetadata;
}

Product.init({
  // ... (tu init sigue igual, no cambias la BD)
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  cost_gems: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: {
    type: DataTypes.ENUM('instant', 'inventory', 'cosmetic'),
    allowNull: false
  },
  type: { type: DataTypes.STRING, allowNull: false },
  effect_metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { sequelize, tableName: 'products', timestamps: false });

export default Product;