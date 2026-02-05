export interface EmblemOption {
  id: string;   // Lo que se guarda en la BD
  name: string; // Nombre visible para el usuario
}

export const AVAILABLE_EMBLEMS: EmblemOption[] = [
  { id: 'cubo.jpeg', name: 'Cubo Hiperdimensional' },
  { id: 'fibonacci.jpeg', name: 'Espiral Áurea' },
  { id: 'fractal.jpeg', name: 'Estrella Fractal' },
  { id: 'icosahedron.jpeg', name: 'Cristal Icosaedro' },
  { id: 'infinito.jpeg', name: 'Lazo Infinito' },
  { id: 'pi.jpeg', name: 'Runa Pi' },
];