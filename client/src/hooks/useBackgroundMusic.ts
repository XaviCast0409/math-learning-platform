import { useEffect, useRef } from 'react';

interface UseBackgroundMusicOptions {
    volume?: number;
    enabled?: boolean;
}

/**
 * Custom hook to manage background music playback during lessons
 * @param audioPath - Path to the audio file (e.g., '/sounds/lesson.mp3')
 * @param options - Configuration options (volume, enabled)
 */
export const useBackgroundMusic = (
    audioPath: string,
    options: UseBackgroundMusicOptions = {}
) => {
    const { volume = 0.3, enabled = true } = options;
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!enabled || !audioPath) return;

        // Create audio element
        const audio = new Audio(audioPath);
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        // Attempt to play (may be blocked by browser autoplay policy)
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('🎵 Background music started');
                })
                .catch((error) => {
                    console.log('⚠️ Audio autoplay blocked by browser:', error.message);
                    // This is expected behavior in many browsers
                    // User interaction will be required to start playback
                });
        }

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [audioPath, enabled, volume]);

    return audioRef;
};
