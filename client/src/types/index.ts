// client/src/types/index.ts

// --- Entidades del Dominio (Modelos) ---

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'admin' | 'moderator';

  // Gamificación
  xp_total: number;
  level: number;
  gems: number;
  lives: number;
  last_life_regen: string | null;
  tower_tickets: number;
  last_ticket_regen: string | null;
  elo_rating: number;

  nextRegen?: string | null;

  // 👇 NUEVOS CAMPOS DE BUFFS (Vienen del Backend)
  xp_boost_expires_at?: string | null;  // Fecha ISO
  gem_boost_expires_at?: string | null; // Fecha ISO

  current_streak: number;
  highest_streak: number;

  metadata?: {
    avatar_url?: string;
    theme?: 'light' | 'dark';
  };
  deletedAt?: string | null;
  // Timestamps
  // 👇 AGREGADO: Para que no de error en el perfil
  current_league?: {
    name: string;
    icon: string;
    minElo: number;
    maxElo: number;
  };

  // 👇 AGREGADO: Timestamps necesarios para "Miembro desde..."
  createdAt: string;
  updatedAt: string;
}

// --- Respuestas de la API (Responses) ---

// Respuesta genérica estándar de tu backend (JSend standard)
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data: T;
}

// Respuesta específica de Autenticación (Login/Register)
export interface AuthResponse {
  status: 'success' | 'fail' | 'error';
  data: {
    user: User;
    token: string;
    streak_reward?: {
      xp: number;
      gems: number;
    };
  };
}

export interface AdminAuthResponse {
  token: string;
  user: User; // Aquí el user está directo
}

// ... tipos anteriores ...

export interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  cost_gems: number;
  category: 'instant' | 'inventory' | 'cosmetic';
  type: string;
  effect_metadata?: any;
}

export interface UserItem {
  id: number; // ID de la relación (para usar/equipar)
  product_id: number;
  user_id: number;
  is_used: boolean;
  is_equipped: boolean;
  acquired_at: string;
  Product: Product; // El backend incluye el detalle del producto aquí
}

export interface ShopResponse {
  products: Product[];
}

export interface InventoryResponse {
  items: UserItem[];
}

export interface RewardsDetail {
  xp: number;
  gems: number;
  bonuses: string[]; // Ej: ["Poción XP x2", "Skin Dragón +10%"]
}