// src/types/admin.types.ts
import type { User } from './index'; // Tu tipo User base

export interface UsersListResponse {
  total: number;
  pages: number;
  data: User[];
}

export interface UserFilters {
  page: number;
  search?: string;
  role?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  img_url?: string;
  createdAt: string;
  deletedAt?: string | null;
  units?: Unit[]; // Opcional porque en la lista paginada no viene
}

export interface Unit {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  description?: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  unit_id: number;
  title: string;
  order_index: number;
  xp_reward: number;
  theory_content?: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: number;
  lesson_id: number;
  type: 'multiple_choice' | 'fill_in' | 'true_false';
  difficulty: number;
  prompt: string;
  options?: any; // JSONB
  correct_answer: string;
  solution_explanation?: string;
}

export interface CourseFilters {
  page: number;
  search?: string;
  level?: string;
}

export interface CourseListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  courses: Course[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  cost_gems: number;
  image_url: string;
  active: boolean;
  category: 'instant' | 'inventory' | 'cosmetic';
  type: string;
  // El metadata es flexible, pero aquí definimos qué esperamos
  effect_metadata: {
    duration_minutes?: number; // Para Boosts
    multiplier?: number;       // Para Boosts (Ej: 2.0 para x2)
    passive_bonus?: {          // Para Skins
      stat: 'xp' | 'gems';
      percent: number;
    };
    [key: string]: any;
  };
}

export interface ProductFilters {
  page?: number;
  search?: string;
  category?: string;
}

export interface ProductListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface Deck {
  id: number;
  unit_id: number;
  name: string;
  description: string;
  image_url: string;
  active: boolean;
  cardsCount?: number; // Para mostrar cuántas cartas tiene en la tabla
}

export interface Flashcard {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  image_url?: string;
}

export interface DeckFilters {
  page: number;
  pageSize?: number;
  search?: string;
  unit_id?: number; // Vital para filtrar por unidad
  active?: string;
}

export interface DeckListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  decks: Deck[];
}

export interface DashboardStats {
  kpi: {
    totalUsers: number;
    newUsers: number;
    totalCourses: number;
    activeProducts: number;
  };
  charts: {
    growth: { name: string; users: number }[];
    content: { name: string; value: number }[];
  };
}

// Agrega esto a src/types/admin.types.ts

// 1. Progreso Académico
export interface UserCourseProgress {
  courseId: number;
  courseTitle: string;
  progressPercent: number; // 0 a 100
  lastLessonDate?: string;
  status: 'active' | 'completed' | 'not_started';
  currentUnit?: string; // En qué unidad va
}

// 2. Inventario del Usuario
export interface UserItem {
  id: number; // ID de la relación (UserItem id)
  productId: number;
  productName: string;
  productImage: string;
  quantity: number; // Cuántos tiene
  acquiredAt: string;
  active: boolean; // Si está equipado o en uso
}

// 3. Log de Actividad
export interface UserLog {
  id: number;
  action: string; // "LOGIN", "PURCHASE", "LESSON_COMPLETE"
  details: string; // "Compró Poción", "IP: 192.168.1.1"
  ipAddress: string;
  createdAt: string;
}