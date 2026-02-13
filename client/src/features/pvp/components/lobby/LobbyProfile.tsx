import { TrendingUp } from 'lucide-react';
import { getLeagueInfo } from '../../../../config/pvp.constants'; // Ajusta la ruta si es necesario
import { clsx } from 'clsx';

interface Props {
  elo: number;
}

export const LobbyProfile = ({ elo }: Props) => {
  const { currentLeague, nextLeague } = getLeagueInfo(elo);

  // Lógica de la barra de progreso
  let progressPercent = 100;
  let pointsToNext = 0;

  if (nextLeague) {
    const totalRange = currentLeague.maxElo - currentLeague.minElo + 1;
    const currentProgress = elo - currentLeague.minElo;
    progressPercent = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
    pointsToNext = nextLeague.minElo - elo;
  }

  // Extraemos el color de fondo específico de la configuración nueva
  // Ejemplo: "bg-yellow-400 border-yellow-400..." -> nos quedamos con "bg-yellow-400"
  const bgTheme = currentLeague.color.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-400';

  return (
    <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl p-5 shadow-retro relative overflow-hidden">
      
      {/* Línea decorativa superior */}
      <div className={clsx("absolute top-0 left-0 w-full h-2", bgTheme)} />

      <div className="flex items-center gap-4 mb-5">
        
        {/* Contenedor del Icono (Imagen) */}
        <div className="w-20 h-20 shrink-0 bg-white p-1 rounded-xl border-2 border-black shadow-sm flex items-center justify-center overflow-hidden">
          <img 
            src={currentLeague.icon} 
            alt={currentLeague.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback por si falla la imagen
              e.currentTarget.onerror = null; 
              e.currentTarget.src = '/assets/pvpElo/pollito.jpeg'; 
            }}
          />
        </div>

        {/* Info de Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Liga Actual
          </p>
          <h2 className="text-xl font-black text-gray-800 leading-tight truncate">
            {currentLeague.name}
          </h2>
          
          <div className="flex items-center gap-1.5 text-brand-blue font-bold text-sm mt-1">
            <div className="p-1 bg-blue-50 rounded text-brand-blue">
                <TrendingUp size={14} strokeWidth={3} />
            </div>
            <span>{elo} Puntos ELO</span>
          </div>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="space-y-2">
        <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden border-2 border-black relative">
           {/* Fondo de la barra */}
          <div 
            className={clsx("h-full transition-all duration-1000 ease-out relative", bgTheme)}
            style={{ width: `${progressPercent}%` }}
          >
             {/* Brillo decorativo sobre la barra */}
             <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 font-bold mt-1">
          {nextLeague 
            ? `Faltan ${pointsToNext} pts para ${nextLeague.name}` 
            : "¡Has alcanzado la Liga Máxima!"}
        </p>
      </div>
    </div>
  );
};