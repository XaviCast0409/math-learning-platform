import { useEffect, useRef } from 'react';

interface Props {
  isVictory: boolean;
  isDefeat: boolean;
  isAnswerCorrect: boolean | null;
}

export const useRaidAudio = ({ isVictory, isDefeat, isAnswerCorrect }: Props) => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const attackSfxRef = useRef<HTMLAudioElement | null>(null);
  const errorSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. CARGA DE AUDIOS 
    // Asegúrate que la ruta sea relativa a la carpeta PUBLIC
    
    // Intenta usar nombres en minúsculas para evitar errores
    bgmRef.current = new Audio('/assets/sounds/fondo.mp3'); 
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.1;

    attackSfxRef.current = new Audio('/assets/sounds/ataque.mp3');
    attackSfxRef.current.volume = 0.6;
    
    errorSfxRef.current = new Audio('/assets/sounds/error.mp3');
    errorSfxRef.current.volume = 0.5;

    // Debugging: Ver si carga
    attackSfxRef.current.onerror = () => console.error("❌ No se encontró: /assets/sounds/ataque.mp3");

    // 2. Intentar reproducir música de fondo
    const startBGM = async () => {
        try {
            if (bgmRef.current) await bgmRef.current.play();
        } catch (err) {
            console.log("Esperando interacción para audio...");
            const unlock = () => {
                bgmRef.current?.play().catch(() => {});
                document.removeEventListener('click', unlock);
            };
            document.addEventListener('click', unlock);
        }
    };
    startBGM();

    return () => {
      bgmRef.current?.pause();
      bgmRef.current = null;
    };
  }, []);

  useEffect(() => {
    if ((isVictory || isDefeat) && bgmRef.current) {
      bgmRef.current.pause();
    }
  }, [isVictory, isDefeat]);

  useEffect(() => {
    if (isAnswerCorrect === null) return;

    const playSfx = async (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (!audioRef.current) return;
        try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
        } catch (error) {
            console.error("Error reproduciendo SFX (Revisa la ruta del archivo)", error);
        }
    };

    if (isAnswerCorrect === true) playSfx(attackSfxRef);
    else playSfx(errorSfxRef);
  }, [isAnswerCorrect]);
};