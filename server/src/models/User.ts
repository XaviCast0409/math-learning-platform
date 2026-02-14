import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { getLeagueFromElo } from '../config/pvp.config';
// ✅ NUEVO: Importamos la calculadora de niveles
import { calculateLevelFromXP } from '../config/gamification.config';
import type Clan from './Clan';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public role!: 'student' | 'admin' | 'moderator';

  // New profile fields
  public full_name!: string;
  public age!: number | null;
  public phone!: string | null;
  public grade_level!: string;

  // Email verification
  public email_verified!: boolean;
  public email_verification_code!: string | null;
  public verification_code_expires_at!: Date | null;

  // Gamification
  public xp_total!: number;
  public level!: number;
  // ✅ NUEVO: Propiedad de TypeScript para el nivel calculado
  public readonly current_level_calc!: number;

  public gems!: number;
  public lives!: number;
  public last_life_regen!: Date | null;
  public tower_tickets!: number;
  public last_ticket_regen!: Date | null;

  // Streaks
  public current_streak!: number;
  public highest_streak!: number;
  public last_activity_date!: Date;

  // PvP
  public elo_rating!: number;
  public xp_boost_expires_at!: Date | null;
  public gem_boost_expires_at!: Date | null;
  public readonly current_league?: { name: string, icon: string, minElo: number, maxElo: number };

  // Config extra
  public metadata!: object;
  public clan_id!: number | null;
  public readonly clan?: Clan;
  public readonly user_items?: any[]; // Cambiar 'any' por UserItem[] cuando importes UserItem para evitar dependencia circular si no está en index
  public readonly inventory?: any[]; // Cambiar 'any' por UserItem[] cuando importes UserItem para evitar dependencia circular si no está en index
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student', 'admin', 'moderator'), defaultValue: 'student' },

  // New profile fields
  full_name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  grade_level: { type: DataTypes.STRING, allowNull: false },

  // Email verification
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verification_code: { type: DataTypes.STRING, allowNull: true },
  verification_code_expires_at: { type: DataTypes.DATE, allowNull: true },

  xp_total: { type: DataTypes.INTEGER, defaultValue: 0 },

  // Nivel guardado en base de datos (se actualizará solo gracias al hook de abajo)
  level: { type: DataTypes.INTEGER, defaultValue: 1 },

  // ✅ NUEVO: CAMPO VIRTUAL (Calculadora Automática)
  // Este campo usa tu fórmula matemática cada vez que consultas el usuario.
  current_level_calc: {
    type: DataTypes.VIRTUAL,
    get() {
      const xp = this.getDataValue('xp_total');
      return calculateLevelFromXP(xp || 0);
    }
  },

  gems: { type: DataTypes.INTEGER, defaultValue: 0 },
  lives: { type: DataTypes.INTEGER, defaultValue: 5 },
  last_life_regen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tower_tickets: { type: DataTypes.INTEGER, defaultValue: 1 },
  last_ticket_regen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  current_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  highest_streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_activity_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  elo_rating: { type: DataTypes.INTEGER, defaultValue: 300 },

  xp_boost_expires_at: { type: DataTypes.DATE, allowNull: true },
  gem_boost_expires_at: { type: DataTypes.DATE, allowNull: true },

  current_league: {
    type: DataTypes.VIRTUAL,
    get() {
      const elo = this.getDataValue('elo_rating');
      return getLeagueFromElo(elo || 300); // Ajusté el default a 300 para coincidir con arriba
    }
  },

  clan_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  // ✅ NUEVO: Hooks para mantener sincronizado el nivel
  hooks: {
    beforeSave: (user: User) => {
      // Si la XP cambió, recalculamos el nivel y lo guardamos en la columna 'level'
      if (user.changed('xp_total')) {
        user.level = calculateLevelFromXP(user.xp_total);
      }
    }
  }
});

export default User;