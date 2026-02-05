export interface AvatarConfig {
  id: number;
  name: string;
  url: string;
  type: 'gif' | 'sprite';
  frames?: number;     // Solo para sprites
  width?: number;      // Solo para sprites
  height?: number;     // Solo para sprites
}