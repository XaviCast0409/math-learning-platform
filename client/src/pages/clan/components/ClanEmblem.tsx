import { clsx } from 'clsx';

interface Props {
  emblemId?: string; 
  className?: string;
}

export const ClanEmblem = ({ emblemId = 'default_shield', className }: Props) => {
  
  // 1. Detectar si es URL externa
  const isExternalUrl = emblemId.startsWith('http');
  
  // 2. Detectar si ya trae extensión (ej: 'cubo.jpeg')
  const hasExtension = emblemId.includes('.');

  // 3. Construir la ruta
  let imageSrc = '';

  if (isExternalUrl) {
    imageSrc = emblemId;
  } else if (hasExtension) {
    // Si ya trae extensión (.jpeg, .png), la usamos tal cual
    imageSrc = `/assets/emblems/${emblemId}`;
  } else {
    // Si NO trae extensión (ej: 'default_shield'), asumimos .png por defecto
    imageSrc = `/assets/emblems/${emblemId}.png`;
  }

  return (
    <div className={clsx("relative overflow-hidden rounded-full border border-gray-200 shadow-sm bg-white", className)}>
      <img 
        src={imageSrc} 
        alt="Clan Emblem"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback si falla la carga
          e.currentTarget.onerror = null; 
          e.currentTarget.src = '/assets/emblems/default_shield.png';
        }}
      />
    </div>
  );
};