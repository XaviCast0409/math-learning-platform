import { motion } from 'framer-motion';
import { Castle, Skull, Ticket, Coins } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useTower } from '../hooks/useTower';
import { useAuth } from '../../../context/AuthContext';
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { TowerGame } from './TowerGame';
import { useNavigate } from 'react-router-dom';
import { TowerLeaderboard } from './TowerLeaderboard';

export default function TowerPage() {
    const { gameState, loading, actions, lastResult, submitting } = useTower();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    // Wrapper para startGame que también refresca el usuario (para actualizar tickets/gemas)
    const handleStartGame = async () => {
        await actions.startGame();
        await refreshUser(); // Actualizamos balance visual
    };

    if (loading) return <div className="p-20 flex justify-center"><GlobalLoading /></div>;

    // Si hay juego activo (o acabado pero mostrando resultados), mostramos el juego
    if (gameState && (gameState.run.is_active || lastResult)) {
        return (
            <TowerGame
                gameState={gameState}
                onAnswer={actions.submitAnswer}
                submitting={submitting}
                lastResult={lastResult}
                onExit={() => {
                    actions.reset();
                    navigate('/learn'); // Redirigir a Learn al salir
                }}
            />
        );
    }

    // Lobby
    const hasTicket = (user?.tower_tickets || 0) > 0;
    const canAfford = hasTicket || (user?.gems || 0) >= 250;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="z-10 w-full max-w-5xl flex flex-col lg:flex-row items-start justify-center gap-12">

                {/* Lobby Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 max-w-md w-full mx-auto text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="bg-gray-800 p-6 rounded-full border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                            <Castle size={64} className="text-purple-400" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        LA TORRE
                    </h1>
                    <p className="text-gray-400 mb-8 text-lg">
                        Sube tan alto como puedas. <br />
                        <span className="text-red-400 font-bold flex items-center justify-center gap-2 mt-2">
                            <Skull size={18} /> Muerte Permanente
                        </span>
                    </p>

                    {/* Balance Display */}
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                            <Ticket size={20} className="text-yellow-400" />
                            <span className="font-bold">{user?.tower_tickets || 0} Tickets</span>
                        </div>
                        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                            <Coins size={20} className="text-yellow-400" />
                            <span className="font-bold">{user?.gems || 0}</span>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 mb-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Recompensas</h3>
                        <ul className="text-left space-y-2 text-sm">
                            <li className="flex items-center gap-2">🪙 <span className="text-white">XaviCoins por cada piso</span></li>
                            <li className="flex items-center gap-2">🔥 <span className="text-white">XP Multiplicada x Piso</span></li>
                            <li className="flex items-center gap-2">🏆 <span className="text-white">Gloria Eterna</span></li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleStartGame}
                        disabled={!canAfford}
                        className={`w-full py-4 text-xl font-black border-none hover:scale-105 transition-transform shadow-lg ${canAfford
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {hasTicket ? (
                            <span className="flex items-center gap-2 justify-center"><Ticket /> USAR TICKET</span>
                        ) : (
                            <span className="flex items-center gap-2 justify-center"><Coins /> PAGAR 250</span>
                        )}
                    </Button>

                    {!canAfford && (
                        <p className="text-red-400 text-xs mt-3 font-bold">
                            Necesitas 1 Ticket o 250 XaviCoins para entrar.
                        </p>
                    )}
                </motion.div>

                {/* Leaderboard Section */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 max-w-md w-full mx-auto"
                >
                    <TowerLeaderboard />
                </motion.div>

            </div>
        </div>
    );
}
