import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Swords, Wifi, WifiOff, XCircle } from 'lucide-react';

// Componentes modulares
import { LobbyProfile } from './components/lobby/LobbyProfile';
import { PlayerList } from './components/lobby/PlayerList';

const PvpLobby = () => {
  const { 
    joinQueue, leaveQueue, isSearching, matchData, 
    isConnected, onlineUsers, sendChallenge 
  } = useSocket();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (matchData && matchData.matchId) {
      navigate(`/pvp/match/${matchData.matchId}`);
    }
  }, [matchData, navigate]);

  const availablePlayers = onlineUsers.filter(u => u.userId !== user?.id);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-start min-h-[80vh] gap-6 p-4 pb-20 relative">
        
        {/* Indicador de Conexión */}
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-sm ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </div>

        {/* Tarjeta de Perfil */}
        <LobbyProfile elo={user?.elo_rating || 0} />

        {/* Botones de Acción */}
        <div className="w-full max-w-md space-y-3">
          {!isSearching ? (
            <Button 
              onClick={joinQueue}
              disabled={!isConnected}
              variant="danger"
              className="w-full text-lg py-4 shadow-retro hover:translate-y-[-2px] hover:shadow-retro-lg transition-all"
              icon={<Swords size={24} strokeWidth={2.5} />}
            >
              BUSCAR PARTIDA RANDOM
            </Button>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-yellow-50 border-2 border-black text-black p-4 rounded-xl flex items-center justify-center gap-3 shadow-retro-sm">
                 <Swords className="animate-spin text-brand-blue" /> 
                 <span className="font-black italic">BUSCANDO RIVAL...</span>
              </div>
              <Button 
                onClick={leaveQueue}
                variant="outline"
                className="w-full border-2 border-black hover:bg-red-50 hover:text-red-600"
                icon={<XCircle size={20} />}
              >
                CANCELAR BÚSQUEDA
              </Button>
            </div>
          )}
        </div>

        {/* Lista de Jugadores */}
        <PlayerList players={availablePlayers} onChallenge={sendChallenge} />

      </div>
    </MainLayout>
  );
};

export default PvpLobby;