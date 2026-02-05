import type { AvatarConfig } from '../types/avatar.types';

interface Props {
  config: AvatarConfig;
  scale?: number;
}

export const AvatarSprite = ({ config, scale = 1 }: Props) => {
  // Caso simple: GIF
  if (config.type === 'gif') {
    return (
      <img 
        src={config.url} 
        alt={config.name} 
        className="object-contain pixelated"
        style={{ transform: `scale(${scale})` }}
      />
    );
  }

  // Caso complejo: Sprite Sheet (CSS Steps)
  const { width = 64, height = 64, frames = 4 } = config;
  const finalPos = -1 * width * frames;

  return (
    <div 
      className="overflow-hidden relative mx-auto"
      style={{
        width: width * scale,
        height: height * scale,
        imageRendering: 'pixelated'
      }}
    >
      <div 
        style={{
          width,
          height,
          backgroundImage: `url(${config.url})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0px 0px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          animation: `play-sprite 1s steps(${frames}) infinite`
        }}
      />
      <style>{`
        @keyframes play-sprite {
          from { background-position-x: 0px; }
          to { background-position-x: ${finalPos}px; }
        }
      `}</style>
    </div>
  );
};