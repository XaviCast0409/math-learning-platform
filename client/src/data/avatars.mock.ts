import type { AvatarConfig } from '../types/avatar.types';

export const MOCK_AVATARS: AvatarConfig[] = [
  { 
    id: 1, 
    name: 'Vikingo LPC', 
    url: '/assets/avatars/image_1fc733.png', // <--- TU IMAGEN
    
    // 👇 CAMBIO IMPORTANTE:
    type: 'sprite',   // Le decimos que es una hoja estática
    width: 64,        // Ancho aproximado de UN cuadrito (tienes que medirlo)
    height: 64,       // Alto aproximado de UN cuadrito
    frames: 6         // Tu imagen tiene 7 muñequitos en fila
  },
  { 
    id: 2, 
    name: 'Mago Azul (GIF)', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/9.gif',
    type: 'gif' // Este se queda como GIF
  },
];