import User from './User';
import Course from './Course';
import Unit from './Unit';
import Lesson from './Lesson';
import Exercise from './Exercise';
import UserProgress from './UserProgress';
import Product from './Product';
import UserItem from './UserItem';
import Match from './Match';
import ActivityLog from './ActivityLog';

// 👇 IMPORTAMOS LOS NUEVOS MODELOS
import Deck from './Deck';
import Flashcard from './Flashcard';
import UserFlashcardProgress from './UserFlashcardProgress';

// 👇 IMPORTAMOS LOS NUEVOS MODELOS
import Clan from './Clan';
import ClanWar from './ClanWar';
import RaidBoss from './RaidBoss';
import RaidParticipation from './RaidParticipation';

import { TowerRun, TowerHistory } from './Tower';

// --- Relaciones Académicas (Cursos y Lecciones) ---
Course.hasMany(Unit, { foreignKey: 'course_id', as: 'units' });
Unit.belongsTo(Course, { foreignKey: 'course_id' });

Unit.hasMany(Lesson, { foreignKey: 'unit_id', as: 'lessons' });
Lesson.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

Lesson.hasMany(Exercise, { foreignKey: 'lesson_id', as: 'exercises' });
Exercise.belongsTo(Lesson, { foreignKey: 'lesson_id' });

// --- Relaciones de Progreso Lecciones ---
User.belongsToMany(Lesson, { through: UserProgress, foreignKey: 'user_id', as: 'learned_lessons' });
Lesson.belongsToMany(User, { through: UserProgress, foreignKey: 'lesson_id', as: 'students' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// --- Relaciones de Tienda e Inventario ---
User.belongsToMany(Product, { through: UserItem, foreignKey: 'user_id', as: 'inventory' });
Product.belongsToMany(User, { through: UserItem, foreignKey: 'product_id' });
// Relaciones directas (Inventario)
User.hasMany(UserItem, { foreignKey: 'user_id' });
UserItem.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(UserItem, { foreignKey: 'product_id' });
UserItem.belongsTo(Product, { foreignKey: 'product_id' });

// --- 👇 NUEVO SISTEMA DE FLASHCARDS (SRS) ---

// 1. Unidades tienen Mazos (Decks)
Unit.hasMany(Deck, { foreignKey: 'unit_id', as: 'decks' });
Deck.belongsTo(Unit, { foreignKey: 'unit_id' });

// 2. Mazos tienen Flashcards (Contenido Admin)
Deck.hasMany(Flashcard, { foreignKey: 'deck_id', as: 'cards' });
Flashcard.belongsTo(Deck, { foreignKey: 'deck_id' });

// 3. Progreso de Usuarios (UserFlashcardProgress)
// El usuario tiene muchos progresos
User.hasMany(UserFlashcardProgress, { foreignKey: 'user_id' });
UserFlashcardProgress.belongsTo(User, { foreignKey: 'user_id' });

// Una Flashcard tiene muchos progresos (de diferentes usuarios)
Flashcard.hasMany(UserFlashcardProgress, { foreignKey: 'flashcard_id' });
UserFlashcardProgress.belongsTo(Flashcard, { foreignKey: 'flashcard_id' });


// --- PvP (Matches) ---
User.hasMany(Match, { foreignKey: 'player1_id', as: 'matches_as_p1' });
User.hasMany(Match, { foreignKey: 'player2_id', as: 'matches_as_p2' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activity_logs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// --- 👇 RELACIONES DE CLANES ---

// Un Usuario pertenece a un Clan
User.belongsTo(Clan, {
  foreignKey: 'clan_id',
  as: 'clan',
  // constraints: false // 👈 REMOVED: Enforcing strict FK
});

Clan.hasMany(User, {
  foreignKey: 'clan_id',
  as: 'members',
  // constraints: false // 👈 REMOVED: Enforcing strict FK
});

// El Clan tiene un dueño (User)
Clan.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Relaciones de Guerra de Clanes
ClanWar.belongsTo(Clan, { foreignKey: 'clan_1_id', as: 'clan1' });
ClanWar.belongsTo(Clan, { foreignKey: 'clan_2_id', as: 'clan2' });

// Un Clan puede tener muchas guerras (como clan 1 o clan 2)
Clan.hasMany(ClanWar, { foreignKey: 'clan_1_id', as: 'wars_started' });
Clan.hasMany(ClanWar, { foreignKey: 'clan_2_id', as: 'wars_received' });


// --- 👇 RELACIONES DE RAIDS (BOSSES) ---

// Relación Muchos a Muchos: Usuarios dañan a Bosses a través de RaidParticipation
User.belongsToMany(RaidBoss, { through: RaidParticipation, foreignKey: 'user_id', as: 'raids' });
RaidBoss.belongsToMany(User, { through: RaidParticipation, foreignKey: 'raid_boss_id', as: 'attackers' });

// Relación directa para consultas rápidas en la tabla pivote
RaidParticipation.belongsTo(User, { foreignKey: 'user_id' });
RaidParticipation.belongsTo(RaidBoss, { foreignKey: 'raid_boss_id' });


export {
  User,
  Course,
  Unit,
  Lesson,
  Exercise,
  UserProgress,
  Product,
  UserItem,
  Match,
  Deck,
  Flashcard,
  UserFlashcardProgress,
  ActivityLog,
  // 👇 Exportamos lo nuevo
  Clan,
  ClanWar,
  RaidBoss,
  RaidParticipation,
  // 👇 Exportamos Modelo de Torre
  TowerRun,
  TowerHistory
};