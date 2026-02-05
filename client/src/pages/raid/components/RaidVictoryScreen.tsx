import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Crown, Loader2, XCircle } from 'lucide-react';
import { Card } from '../../../components/common/Card';   // Ajusta la ruta si es necesario
import { Button } from '../../../components/common/Button'; // Ajusta la ruta si es necesario

// Definimos el tipo para los datos del MVP
interface MvpData {
  username: string;
  totalDamage: number;
}

// ----------------------------------------------------------------------
// 1. PANTALLA DE CARGA (Loading)
// ----------------------------------------------------------------------
export const RaidLoadingScreen = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="relative mb-4">
             <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full animate-pulse" />
             <Loader2 className="h-12 w-12 text-red-500 animate-spin relative z-10" />
        </div>
        <p className="font-bold uppercase tracking-widest text-sm text-slate-400 animate-pulse">
            Conectando al servidor de Raid...
        </p>
    </div>
);

// ----------------------------------------------------------------------
// 2. PANTALLA DE DERROTA (Time's Up)
// ----------------------------------------------------------------------
export const RaidDefeatScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 animate-in zoom-in-95 p-4">
       <div className="bg-red-500/10 p-6 rounded-full border-4 border-red-500 mb-4 animate-pulse">
          <XCircle size={64} className="text-red-500" />
       </div>
       
       <h2 className="text-4xl font-black uppercase tracking-widest text-red-500 text-center">
           Tiempo Agotado
       </h2>
       <p className="text-slate-400 text-center max-w-xs">
           El Boss ha escapado. Reagrúpense e inténtenlo de nuevo.
       </p>

       <Button 
          className="bg-slate-700 hover:bg-slate-600 w-full max-w-xs border border-slate-500" 
          onClick={() => navigate('/learn')}
       >
          VOLVER AL LOBBY
       </Button>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. PANTALLA DE VICTORIA (Victory + MVP)
// ----------------------------------------------------------------------
export const RaidVictoryScreen = ({ mvpData }: { mvpData: MvpData | null }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 animate-in fade-in duration-700 p-4 relative overflow-hidden">
       
       {/* Efectos de Fondo */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />
       
       {/* Título y Trofeo */}
       <div className="relative z-10 text-center mt-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-24 h-24 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.5)] rotate-3 border-4 border-yellow-300"
          >
              <Trophy className="text-white w-12 h-12" strokeWidth={3} />
          </motion.div>
          
          <h2 className="text-5xl font-black italic uppercase tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">
              ¡Boss Caído!
          </h2>
       </div>

       {/* 👇 SECCIÓN MVP (Solo se muestra si existe mvpData) */}
       {mvpData && (
           <motion.div 
             initial={{ y: 20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }} 
             transition={{ delay: 0.3 }}
             className="w-full max-w-xs bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/40 flex flex-col items-center shadow-lg backdrop-blur-sm"
           >
               <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2 flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
                   <Crown size={14} className="fill-yellow-400" /> MVP de la Raid
               </div>
               <p className="text-2xl font-black text-white tracking-tight">{mvpData.username}</p>
               <p className="text-sm text-yellow-200/80 font-mono font-bold mt-1">
                  Daño Total: {mvpData.totalDamage}
               </p>
           </motion.div>
       )}

       {/* Tarjeta de Recompensas */}
       <Card className="max-w-sm w-full bg-slate-800/90 border-slate-700 backdrop-blur-md p-6 z-10">
          <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">XP Clan</span>
                  <span className="text-yellow-400 font-black text-xl">+500</span>
              </div>
              <div className="flex justify-between items-center pb-3">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Gemas</span>
                  <span className="text-blue-400 font-black text-xl">+50</span>
              </div>
              
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                onClick={() => navigate('/learn')}
              >
                  RECLAMAR VICTORIA
              </Button>
          </div>
       </Card>
    </div>
  );
};