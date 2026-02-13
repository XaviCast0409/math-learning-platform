import { useState } from 'react';
import { Button } from '../../../../components/common/Button';
import { Modal } from '../../../../components/common/Modal';
import { adminRaidApi, type SpawnBossDto } from '../../api/adminRaidApi';
import { toast } from 'react-hot-toast';

interface CreateBossModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateBossModal({ isOpen, onClose, onSuccess }: CreateBossModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SpawnBossDto>({
        name: '',
        hp: 100000,
        duration: 24, // horas default en UI, convertir a minutos si API espera minutos
        image: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'hp' || name === 'duration' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convertir duración de horas a minutos para la API (si el backend espera minutos)
            // Revisando controller: const { duration } = req.body;
            // Asumiremos que el backend espera MINUTOS.
            const payload = {
                ...formData,
                duration: formData.duration * 60
            };

            await adminRaidApi.spawnBoss(payload);
            toast.success('¡Jefe de Raid Invocado!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al invocar jefe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invocar Nuevo Jefe de Raid">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Jefe</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Mega Pitágoras"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Vida Total (HP)</label>
                        <input
                            type="number"
                            name="hp"
                            required
                            min="1000"
                            value={formData.hp}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Duración (Horas)</label>
                        <input
                            type="number"
                            name="duration"
                            required
                            min="1"
                            max="72"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">URL de Imagen (Opcional)</label>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                        placeholder="https://..."
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Invocando...' : 'Invocar Jefe'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
