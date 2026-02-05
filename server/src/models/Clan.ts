import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
// 👇 Importamos la configuración
import { CLAN_LEVELS, MAX_CLAN_LEVEL } from '../config/clanLevels.config';

class Clan extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public emblem_id!: string;
  public total_xp!: number;
  public min_elo_required!: number;
  public owner_id!: number | null;

  // 👇 Propiedades calculadas (no están en la BD, se generan al vuelo)
  public readonly level!: number;
  public readonly max_members!: number;
  public readonly progress_percent!: number; // Para la barra de exp (0% a 100%)
  public readonly current_benefits!: string[];
}

Clan.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.STRING, allowNull: true },
  emblem_id: { type: DataTypes.STRING, defaultValue: 'default_shield' },
  total_xp: { type: DataTypes.INTEGER, defaultValue: 0 },
  min_elo_required: { type: DataTypes.INTEGER, defaultValue: 0 },
  owner_id: { type: DataTypes.INTEGER, allowNull: true },

  // --- CAMPOS VIRTUALES ---

  // 1. Calcular Nivel Actual
  level: {
    type: DataTypes.VIRTUAL,
    get() {
      const xp = this.getDataValue('total_xp') || 0;
      let currentLvl = 1;
      
      // Buscamos el nivel más alto que cumpla con la XP
      for (let i = MAX_CLAN_LEVEL; i >= 1; i--) {
        if (xp >= CLAN_LEVELS[i].minXp) {
          currentLvl = i;
          break;
        }
      }
      return currentLvl;
    }
  },

  // 2. Calcular Capacidad (Miembros Máximos)
  max_members: {
    type: DataTypes.VIRTUAL,
    get() {
      // Usamos la propiedad 'level' que acabamos de definir arriba
      // @ts-ignore (Sequelize a veces se queja de acceder a getters internos)
      const lvl = this.level; 
      return CLAN_LEVELS[lvl]?.capacity || 10;
    }
  },

  // 3. Beneficios Actuales (Para mostrar en el perfil del clan)
  current_benefits: {
    type: DataTypes.VIRTUAL,
    get() {
      // @ts-ignore
      const lvl = this.level;
      return CLAN_LEVELS[lvl]?.benefits || [];
    }
  },

  // 4. Porcentaje de Progreso (Para la barra visual en el Frontend)
  progress_percent: {
    type: DataTypes.VIRTUAL,
    get() {
      const xp = this.getDataValue('total_xp') || 0;
      // @ts-ignore
      const lvl = this.level;

      if (lvl >= MAX_CLAN_LEVEL) return 100; // Nivel máximo

      const currentLvlData = CLAN_LEVELS[lvl];
      const nextLvlData = CLAN_LEVELS[lvl + 1];

      // XP necesaria para este nivel específico
      const xpInThisLevel = xp - currentLvlData.minXp;
      const xpNeededForNext = nextLvlData.minXp - currentLvlData.minXp;

      // Regla de tres simple
      return Math.min(100, Math.floor((xpInThisLevel / xpNeededForNext) * 100));
    }
  }

}, { sequelize, tableName: 'clans', timestamps: true });

export default Clan;