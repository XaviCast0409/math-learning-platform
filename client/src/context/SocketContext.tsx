import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { MatchStartPayload } from '../types/pvp.types';

// 1. Definimos la interfaz de Usuario Online
export interface OnlineUser {
  userId: number;
  socketId: string;
  username: string;
  elo: number;
  status: 'IDLE' | 'SEARCHING' | 'PLAYING';
}

// 2. Estructura de un reto entrante
export interface ChallengeRequest {
  challengerId: number;
  challengerName: string;
}

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  isSearching: boolean;
  matchData: MatchStartPayload | null;
  
  // 🆕 3. CAMBIO: Array de retos en lugar de uno solo
  onlineUsers: OnlineUser[]; 
  incomingChallenges: ChallengeRequest[]; // <-- Antes era incomingChallenge singular

  joinQueue: () => void;
  leaveQueue: () => void;
  clearMatchData: () => void;
  
  // 4. Funciones para retar
  sendChallenge: (targetUserId: number) => void;
  respondToChallenge: (targetUserId: number, accept: boolean) => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);
const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = envUrl.replace('/api', '');

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchData, setMatchData] = useState<MatchStartPayload | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  // 🆕 5. CAMBIO: Estado inicial como Array vacío
  const [incomingChallenges, setIncomingChallenges] = useState<ChallengeRequest[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setMatchData(null);
        setOnlineUsers([]);
        setIncomingChallenges([]);
      }
      return;
    }

    if (socket && socket.connected) return;

    console.log("🔌 Conectando al servicio PvP...");
    
    const newSocket = io(SOCKET_URL, {
      auth: { token }, 
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log("✅ Conectado a PvP Socket. ID:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log("❌ Desconectado del PvP Socket");
      setIsConnected(false);
      setIsSearching(false);
      setOnlineUsers([]);
      setIncomingChallenges([]);
    });

    // --- EVENTOS DE BÚSQUEDA AUTOMÁTICA ---
    newSocket.on('queue_status', (data: { status: string }) => {
       if (data.status === 'waiting') setIsSearching(true);
       else setIsSearching(false);
    });

    newSocket.on('match_start', (data: MatchStartPayload) => {
        console.log("⚔️ ¡PARTIDA ENCONTRADA!", data);
        setIsSearching(false);
        setIncomingChallenges([]); // Limpiamos todos los retos al empezar
        setMatchData(data);
    });

    // 6. EVENTOS DE LISTA DE USUARIOS Y RETOS
    newSocket.on('online_users_update', (users: OnlineUser[]) => {
        setOnlineUsers(users);
    });

    // 👇 CAMBIO CLAVE: Cuando llega 'incoming_challenge', lo agregamos a la lista
    // IMPORTANTE: Asegúrate de que el backend emita 'incoming_challenge' (singular o como lo tengas)
    // Si tu backend emite 'challenge_received', cambia el nombre del evento aquí.
    // Asumiré que tu backend emite 'incoming_challenge' basado en tu código anterior.
    newSocket.on('incoming_challenge', (data: ChallengeRequest) => {
        console.log("🔔 Reto recibido de:", data.challengerName);
        setIncomingChallenges(prev => {
            // Evitar duplicados por seguridad
            if (prev.find(c => c.challengerId === data.challengerId)) return prev;
            return [...prev, data];
        });
    });

    newSocket.on('challenge_declined', (data: { message: string }) => {
        alert(data.message); 
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]); 

  // --- FUNCIONES ---

  const joinQueue = () => {
    if (socket && isConnected) {
      console.log("🔍 Buscando partida...");
      setMatchData(null);
      socket.emit('join_queue');
      setIsSearching(true); 
    }
  };

  const leaveQueue = () => {
    if (socket && isConnected) {
      console.log("Kb Cancelando búsqueda...");
      socket.emit('leave_queue');
      setIsSearching(false);
    }
  };

  const clearMatchData = () => {
    setMatchData(null);
  };

  // 7. FUNCIONES DE RETO
  const sendChallenge = (targetUserId: number) => {
    if (socket && isConnected) {
        console.log(`⚔️ Retando al usuario ${targetUserId}`);
        socket.emit('challenge_player', { targetUserId });
    }
  };

  const respondToChallenge = (targetUserId: number, accept: boolean) => {
    if (socket && isConnected) {
        console.log(`📩 Respondiendo reto: ${accept ? 'SI' : 'NO'}`);
        socket.emit('challenge_response', { targetUserId, accept });
        
        // 👇 CAMBIO: Removemos solo este reto específico de la lista
        setIncomingChallenges(prev => prev.filter(c => c.challengerId !== targetUserId));
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      isSearching, 
      matchData, 
      onlineUsers,
      incomingChallenges, // Exportamos la lista
      joinQueue, 
      leaveQueue,
      clearMatchData,
      sendChallenge,
      respondToChallenge,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de un SocketProvider');
  }
  return context;
};