import type { AvatarConfig } from '../types/avatar.types'; // Tu interfaz visual
import type { UserItem } from '../types'; // Tu interfaz de base de datos

// Transforma la respuesta de la BD a la Configuración Visual
export const productToAvatarConfig = (userItem: UserItem): AvatarConfig => {
  // Aseguramos que Product existe (por si acaso viene populate parcial)
  const p = userItem.Product;
  if (!p) return { id: 0, name: 'Error', url: '', type: 'gif' };

  const meta = p.effect_metadata || {};

  return {
    id: userItem.id, // Usamos el ID del ítem en inventario (UserItem.id), no del producto
    name: p.name,
    url: p.image_url,
    
    // Determinamos si es GIF o Sprite Sheet basado en la metadata
    type: (meta.sprite_type as 'gif' | 'sprite') || 'gif',
    
    // Solo si es sprite, pasamos las medidas
    frames: meta.total_frames,
    width: meta.frame_width,
    height: meta.frame_height
  };
};