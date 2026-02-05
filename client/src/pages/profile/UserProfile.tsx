import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Trophy, Flame, Zap, LogOut, Gem, TrendingUp, ChevronRight } from 'lucide-react'; // Agregué ChevronRight
import { getLeagueInfo } from '../../config/pvp.constants';
import { clsx } from 'clsx';

// API y Utils
import { shopApi } from '../../api/shop.api';
import { productToAvatarConfig } from '../../utils/avatarAdapter';
import type { AvatarConfig } from '../../types/avatar.types';

// Componentes Visuales
import { WardrobeModal } from '../../avatar/WardrobeModal';
import { UserIdentityCard } from './UserIdentityCard';
import { RankingModal } from './RankingModal'; // 👈 IMPORTANTE: Importamos el Modal

// Avatar por defecto
const DEFAULT_AVATAR: AvatarConfig = {
  id: 0,
  name: 'Novato',
  url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/11.gif', 
  type: 'gif'
};

// LÓGICA DE NIVELES (Backend Config)
const BASE_XP = 1000;
const GROWTH_FACTOR = 1.1;

const calculateTotalXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  const n = level - 1;
  return Math.floor(BASE_XP * ( (Math.pow(GROWTH_FACTOR, n) - 1) / (GROWTH_FACTOR - 1) ));
};

export default function UserProfile() {
  const { user, logout } = useAuth();
  
  // --- ESTADOS ---
  const [currentAvatar, setCurrentAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [myAvatars, setMyAvatars] = useState<AvatarConfig[]>([]);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);
  
  // 👇 NUEVO ESTADO PARA EL RANKING
  const [showRanking, setShowRanking] = useState(false);

  // 1. CARGA INICIAL
  useEffect(() => {
    loadCurrentLook();
  }, []);

  const loadCurrentLook = async () => {
    try {
      const equippedItems = await shopApi.getAvatar();
      const activeSkin = equippedItems.find(item => item.Product?.type === 'cosmetic_avatar');
      
      if (activeSkin) {
        setCurrentAvatar(productToAvatarConfig(activeSkin));
      } else {
        setCurrentAvatar(DEFAULT_AVATAR);
      }
    } catch (error) {
      console.error("Error cargando avatar:", error);
    }
  };

  // 2. ABRIR ARMARIO
  const handleOpenWardrobe = async () => {
    setIsWardrobeOpen(true);
    setLoadingWardrobe(true);
    try {
      const allItems = await shopApi.getInventory();
      const avatarItems = allItems.filter(item => 
         item.Product?.category === 'cosmetic' && item.Product?.type === 'cosmetic_avatar'
      );
      const visualList = avatarItems.map(productToAvatarConfig);
      setMyAvatars(visualList);
    } catch (error) {
      console.error("Error abriendo armario:", error);
    } finally {
      setLoadingWardrobe(false);
    }
  };

  // 3. EQUIPAR
  const handleEquipAvatar = async (visualAvatar: AvatarConfig) => {
    setCurrentAvatar(visualAvatar);
    setIsWardrobeOpen(false);
    try {
      await shopApi.equipItem(visualAvatar.id);
    } catch (error) {
      alert("Error al equipar el avatar.");
      loadCurrentLook(); 
    }
  };

  // --- CÁLCULOS DE PROGRESO ---
  const currentLevel = user?.level || 1;
  const xpCurrentTotal = user?.xp_total || 0;
  const xpStartOfLevel = calculateTotalXpForLevel(currentLevel);
  const xpEndOfLevel = calculateTotalXpForLevel(currentLevel + 1);
  const xpProgressInLevel = Math.max(0, xpCurrentTotal - xpStartOfLevel);
  const xpRequiredForLevel = xpEndOfLevel - xpStartOfLevel;
  const progressPercent = Math.min(100, Math.max(0, (xpProgressInLevel / xpRequiredForLevel) * 100));

  // --- ELO Y LIGAS ---
  const elo = user?.elo_rating || 0;
  const { currentLeague } = getLeagueInfo(elo);

  // --- COMPONENTE INTERNO STATBOX ---
  interface StatBoxProps {
    icon: any;
    label: string;
    value?: string | number;
    subValue?: string;
    colorClass?: string;
    image?: string; 
    leagueTheme?: string; 
  }

  const StatBox = ({ icon: Icon, label, value, colorClass, subValue, image, leagueTheme }: StatBoxProps) => {
    if (image && leagueTheme) {
      const bgClass = leagueTheme.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-100';

      return (
        <div className={clsx(
          "rounded-3xl flex items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all h-32 p-0",
          bgClass
        )}>
           <div className="w-full h-full flex items-center justify-center p-2">
             <img 
               src={image} 
               alt="League Icon" 
               className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm hover:scale-110 transition-transform duration-500"
               onError={(e) => { e.currentTarget.src = '/assets/pvpElo/pollito.jpeg'; }}
             />
           </div>
           
           <div className="absolute top-2 right-2 opacity-30 text-black">
              <Trophy size={16} />
           </div>
        </div>
      );
    }

    return (
      <div className={clsx(
        "border-2 border-gray-100 rounded-3xl p-4 flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-all h-32 relative overflow-hidden",
      )}>
        <Icon className={clsx("mb-2", colorClass)} size={28} strokeWidth={2.5} />
        <span className="font-black text-3xl text-gray-800 tracking-tight">{value}</span>
        {subValue && <span className="text-[10px] font-bold text-gray-400">{subValue}</span>}
        <span className="absolute bottom-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-light p-4 pt-8 pb-24 max-w-md mx-auto relative overflow-hidden">
      
      <WardrobeModal 
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        avatars={myAvatars}
        selectedAvatar={currentAvatar}
        onSelect={handleEquipAvatar}
        isLoading={loadingWardrobe}
      />

      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">MI PERFIL</h1>
      </div>

      <UserIdentityCard 
        user={user}
        leagueName={currentLeague.name}
        currentAvatar={currentAvatar}
        onOpenWardrobe={handleOpenWardrobe}
      />

      {/* Barra de Progreso */}
      <Card className="mb-6 border-0 shadow-sm ring-1 ring-gray-100 bg-white" title="">
        <div className="px-2 pt-2 pb-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-black text-brand-blue flex items-center gap-1.5">
                <div className="p-1 bg-blue-50 rounded-md">
                  <Zap size={14} fill="currentColor" /> 
                </div>
                Nivel {currentLevel}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {xpProgressInLevel.toLocaleString()} / {xpRequiredForLevel.toLocaleString()} XP
              </span>
            </div>
            
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                 className="h-full bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                 style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <p className="text-[10px] text-gray-400 text-right mt-1.5 font-medium">
              ¡Te faltan {(xpRequiredForLevel - xpProgressInLevel).toLocaleString()} XP para subir!
            </p>
        </div>
      </Card>

      {/* Grid de Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-in slide-in-from-bottom-4 duration-500">
        <StatBox icon={TrendingUp} label="Rating ELO" value={user?.elo_rating} colorClass="text-brand-blue" />
        <StatBox icon={Trophy} label="" image={currentLeague.icon} leagueTheme={currentLeague.color} />
        <StatBox icon={Flame} label="Racha Días" value={user?.current_streak} colorClass="text-brand-red fill-brand-red" />
        <StatBox icon={Gem} label="Gemas" value={user?.gems} colorClass="text-purple-500 fill-purple-500" />
      </div>

      {/* 👇 3. BOTÓN DE CLASIFICACIÓN (RANKING) - DISEÑO INTEGRADO */}
      <button 
        onClick={() => setShowRanking(true)}
        className="w-full mb-4 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border-2 border-gray-100 active:scale-[0.98] transition-transform hover:border-yellow-400 hover:shadow-md group"
      >
        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white transition-colors">
          <Trophy size={24} fill="currentColor" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-black text-gray-800 text-lg leading-none mb-1">Clasificación</h3>
          <p className="text-xs font-bold text-gray-400">Ver ranking global</p>
        </div>

        <ChevronRight className="text-gray-300 group-hover:text-yellow-400" />
      </button>

      {/* Botón Cerrar Sesión */}
      <Button 
        variant="danger" 
        className="w-full py-4 text-sm font-bold shadow-none border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-200" 
        onClick={logout} 
        icon={<LogOut size={18} />}
      >
        CERRAR SESIÓN
      </Button>

      <div className="text-center mt-8 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Math Learning Platform v1.0
        </p>
        <p className="text-[9px] font-mono text-gray-300 mt-1">
          ID: {user?.id}
        </p>
      </div>

      {/* 👇 MODAL DE RANKING RENDERIZADO AQUÍ */}
      {showRanking && (
          <RankingModal onClose={() => setShowRanking(false)} />
      )}
      
    </div>
  );
}