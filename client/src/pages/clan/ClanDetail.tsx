import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Swords, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { clanApi, type Clan } from '../../api/clan.api';
import { useClan } from './hooks/useClan';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ClanMembersList } from './components/ClanMembersList';
import { toast } from 'react-hot-toast';
import { ClanEmblem } from './components/ClanEmblem'; // 👈 IMPORTAR

export default function ClanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { myClan, loading: loadingMyClan, actions } = useClan();
  const [viewingClan, setViewingClan] = useState<Clan | null>(null);
  const [loadingView, setLoadingView] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        setLoadingView(true);
        const [data] = await Promise.all([
             clanApi.getClanById(Number(id)),
             new Promise(resolve => setTimeout(resolve, 600))
        ]);
        setViewingClan(data.clan);
      } catch (error) {
        console.error("Error cargando clan:", error);
        toast.error("No se pudo cargar la información del clan");
        navigate('/clan/browser');
      } finally {
        setLoadingView(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loadingView || loadingMyClan) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <Loader2 size={48} className="text-brand-blue animate-spin mb-4" />
        </div>
      );
  }

  if (!viewingClan) return <div className="p-10 text-center">Clan no encontrado</div>;

  const isMyClan = myClan?.id === Number(viewingClan.id);
  const amILeader = myClan?.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform">
          <ArrowLeft />
        </button>
        <h1 className="text-lg font-black text-gray-800 italic uppercase truncate">{viewingClan.name}</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* Banner Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex justify-center mb-4 relative z-10">
            {/* 👇 AQUÍ USAMOS TU NUEVO COMPONENTE DE EMBLEMA */}
            <ClanEmblem 
                emblemId={viewingClan.emblem_id} 
                className="w-24 h-24 border-4 border-white shadow-lg" 
            />
          </div>

          <h2 className="text-2xl font-black text-gray-800 relative z-10">{viewingClan.name}</h2>
          <p className="text-gray-500 text-sm mb-4 relative z-10">{viewingClan.description}</p>

          <div className="flex justify-center gap-6 text-sm relative z-10">
            <div className="flex flex-col items-center">
              <span className="font-black text-gray-800 text-lg">{viewingClan.level}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Nivel</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-black text-gray-800 text-lg">
                {viewingClan.members?.length || 0}/30
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Miembros</span>
            </div>
          </div>
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-white -z-0"></div>
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
          {!myClan && (
            <Button
              className="w-full"
              variant="primary"
              onClick={() => actions.joinClan(viewingClan.id)}
              icon={<Users size={18} />}
            >
              UNIRSE A ESTE CLAN
            </Button>
          )}

          {myClan && !isMyClan && amILeader && (
            <Button
              variant="danger"
              className="w-full"
              onClick={async () => {
                 const success = await actions.sendChallenge(viewingClan.id);
                 if(success) navigate('/clan');
              }}
              icon={<Swords size={18} />}
            >
              DESAFIAR A GUERRA
            </Button>
          )}

          {myClan && !isMyClan && !amILeader && (
            <div className="bg-gray-100 p-4 rounded-xl text-center flex flex-col items-center gap-2">
                <Swords className="text-gray-300" size={24} />
                <p className="text-xs font-bold text-gray-500">
                    Solo tu líder puede declarar la guerra a este clan.
                </p>
            </div>
          )}

          {isMyClan && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-center text-sm font-bold border border-green-100 flex items-center justify-center gap-2">
                <Shield size={16} /> Este es tu clan
            </div>
          )}
        </div>

        {/* Lista de Miembros */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-backwards">
            <ClanMembersList
            members={viewingClan.members || []}
            ownerId={viewingClan.owner_id}
            onKick={() => { }}
            />
        </div>

      </div>
    </div>
  );
}