import { useState, useCallback, useEffect } from 'react';
import { towerApi, type TowerStatusResponse, type TowerAnswerResponse } from '../api/tower.api';
import { toast } from 'react-hot-toast';
// import { useConfirm } from '../../../context/ConfirmContext'; // Validar si necesitamos confirmación manual o directo

export const useTower = () => {
    const [gameState, setGameState] = useState<TowerStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<TowerAnswerResponse | null>(null);
    // const { confirm } = useConfirm();

    // Cargar estado inicial
    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            const data = await towerApi.getStatus();
            setGameState(data);
        } catch (error) {
            console.error('Error fetching tower status', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Iniciar nueva run
    const startGame = async () => {
        // La confirmación ahora se maneja en el botón de la UI (TowerPage) mostrando el costo
        try {
            setLoading(true);
            setLastResult(null); // Reset anterior
            const response = await towerApi.startRun();
            const { costType } = response;

            await fetchStatus(); // Recargar para obtener la primera pregunta

            if (costType) {
                toast.success(`¡Entraste a la Torre! Costo: ${costType}`, { icon: '🏰' });
            } else {
                toast.success('¡Retomando partida anterior!', { icon: '🔄' });
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No se pudo iniciar');
        } finally {
            setLoading(false);
        }
    };

    // Enviar respuesta
    const submitAnswer = async (answer: string) => {
        if (!gameState) return;

        setSubmitting(true);
        try {
            const result = await towerApi.submitAnswer(gameState.question.id, answer);

            if (result.correct) {
                toast.success('¡Correcto! Subiendo de piso...', { icon: '⬆️' });
                // Pequeño delay para feedback visual
                setTimeout(() => fetchStatus(), 500);
            } else {
                toast.error('¡Incorrecto! Perdiste una vida.', { icon: '💔' });

                if (result.gameOver) {
                    toast('GAME OVER', { icon: '💀' });
                    setLastResult(result);

                    // Actualizamos el estado local para reflejar el Game Over sin borrar todo
                    setGameState(prev => prev ? {
                        ...prev,
                        run: {
                            ...prev.run,
                            is_active: false,
                            lives_left: 0,
                            score: result.rewards?.score || prev.run.score
                        }
                    } : null);

                } else {
                    // Actualizar vidas localmente
                    setGameState(prev => prev ? {
                        ...prev,
                        run: { ...prev.run, lives_left: result.lives }
                    } : null);
                }
            }
        } catch (error) {
            toast.error('Error al enviar respuesta');
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setGameState(null);
        setLastResult(null);
        // fetchStatus(); // No need to fetchStatus here if we are navigating away or if UI handles it
    };

    return {
        gameState,
        loading,
        submitting,
        lastResult,
        actions: { startGame, submitAnswer, refresh: fetchStatus, reset }
    };
};
