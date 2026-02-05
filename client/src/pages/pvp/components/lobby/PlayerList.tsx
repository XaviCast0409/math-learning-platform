import { Users, WifiOff } from 'lucide-react';
import { Button } from '../../../../components/common/Button';

interface Props {
    players: any[]; // Usa tu tipo User/OnlineUser
    onChallenge: (id: number) => void;
}

export const PlayerList = ({ players, onChallenge }: Props) => {
    return (
        <div className="w-full max-w-md mt-2">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Users size={20} className="text-black" strokeWidth={2.5} />
            <h3 className="text-lg font-black text-black uppercase italic">
              En Línea ({players.length})
            </h3>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-retro-sm min-h-[120px]">
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                <WifiOff size={30} />
                <p className="text-sm font-bold">No hay nadie más conectado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-black hover:bg-white transition-colors">
                    
                    {/* Info del Jugador */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-yellow rounded-full border-2 border-black flex items-center justify-center font-black text-sm shadow-sm">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-sm text-black leading-none">{player.username}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`w-2 h-2 rounded-full border border-black ${
                            player.status === 'IDLE' ? 'bg-green-500' : 
                            player.status === 'PLAYING' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {player.status === 'IDLE' ? 'Disponible' : 
                             player.status === 'PLAYING' ? 'Jugando' : 'Buscando'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Retar */}
                    <Button
                      variant="primary" 
                      disabled={player.status !== 'IDLE'} 
                      onClick={() => onChallenge(player.userId)}
                      className={`text-[10px] px-3 py-1 h-8 min-h-0 rounded-lg ${
                        player.status !== 'IDLE' 
                          ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-400 shadow-none' 
                          : 'bg-black text-white hover:bg-gray-800 shadow-retro-sm border-black'
                      }`}
                    >
                      {player.status === 'PLAYING' ? 'OCUPADO' : 'RETAR'}
                    </Button>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    );
};