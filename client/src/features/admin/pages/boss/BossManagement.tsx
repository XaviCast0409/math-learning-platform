import { useState, useEffect } from 'react';
import { Button } from '../../../../components/common/Button';
import { adminRaidApi } from '../../api/adminRaidApi';
import { CreateBossModal } from './CreateBossModal';
import { Swords, Skull, Clock, Shield } from 'lucide-react';

export default function BossManagement() {
    const [currentBoss, setCurrentBoss] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchBoss = async () => {
        try {
            setLoading(true);
            const data = await adminRaidApi.getCurrentBoss();
            setCurrentBoss(data.active ? data.boss : null);
        } catch (error) {
            console.error('Error fetching boss', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoss();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Gestión de Jefes de Raid</h1>
                    <p className="text-gray-400">Invoca eventos especiales y gestiona el jefe activo.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <Swords size={20} />
                    INVOCAR JEFE
                </Button>
            </div>

            {loading ? (
                <div className="text-white">Cargando jefe actual...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Status Card */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Skull className="text-red-500" />
                            Estado Actual
                        </h2>

                        {currentBoss ? (
                            <div className="flex flex-col md:flex-row gap-6 mt-4">
                                <div className="w-32 h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0">
                                    {currentBoss.image_url ? (
                                        <img src={currentBoss.image_url} alt={currentBoss.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Skull size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="text-2xl font-bold text-red-400">{currentBoss.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Shield size={16} />
                                        <span>HP: {currentBoss.current_hp} / {currentBoss.total_hp}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full transition-all duration-500"
                                            style={{ width: `${(currentBoss.current_hp / currentBoss.total_hp) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Clock size={14} />
                                        <span>Finaliza: {new Date(currentBoss.end_time).toLocaleString()}</span>
                                    </div>
                                    <div className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                        ACTIVO
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                                <p>No hay ningún Jefe de Raid activo actualmente.</p>
                                <p className="text-sm mt-2">Invoca uno para comenzar un evento global.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Templates (Future) */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 opacity-50 pointer-events-none">
                        <h2 className="text-xl font-bold text-white mb-4">Plantillas Rápidas (Próximamente)</h2>
                        <div className="space-y-2">
                            <div className="p-3 bg-gray-700 rounded flex justify-between">
                                <span>Golem de Álgebra</span>
                                <Button variant="secondary">Usar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CreateBossModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchBoss}
            />
        </div>
    );
}
