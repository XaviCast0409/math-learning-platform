import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { towerApi, type TowerLeaderboardEntry } from '../api/tower.api';

export function TowerLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<TowerLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await towerApi.getLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error('Error fetching leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="text-gray-400 text-sm animate-pulse">Cargando ranking...</div>;

    if (leaderboard.length === 0) return <div className="text-gray-500 text-sm">Sé el primero en subir a la Torre.</div>;

    return (
        <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700 p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-yellow-400" size={20} />
                <h3 className="text-lg font-bold text-white">Mejores Ascensos</h3>
            </div>

            <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${index === 0 ? 'bg-yellow-900/20 border-yellow-500/50' :
                            index === 1 ? 'bg-gray-700/30 border-gray-400/50' :
                                index === 2 ? 'bg-orange-900/20 border-orange-500/50' :
                                    'bg-gray-800 border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 font-black text-lg">
                                {index === 0 ? <span className="text-2xl">🥇</span> :
                                    index === 1 ? <span className="text-2xl">🥈</span> :
                                        index === 2 ? <span className="text-2xl">🥉</span> :
                                            <span className="text-gray-500">#{index + 1}</span>
                                }
                            </div>

                            <div className="flex flex-col">
                                <span className={`font-bold ${index < 3 ? 'text-white' : 'text-gray-300'}`}>
                                    {entry.User?.username || 'Anónimo'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(entry.ended_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-bold text-purple-400">
                                Piso {entry.floor_reached}
                            </div>
                            <div className="text-xs text-yellow-500/80 font-mono">
                                {entry.score_achieved} pts
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
