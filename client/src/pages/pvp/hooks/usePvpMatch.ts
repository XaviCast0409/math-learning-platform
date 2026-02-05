import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

type GameState = 'WAITING' | 'PLAYING' | 'FINISHED';

export const usePvpMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matchData, socket, clearMatchData } = useSocket();

  // Estados
  const [gameState, setGameState] = useState<GameState>('WAITING');
  const [countdown, setCountdown] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(300);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEmote, setActiveEmote] = useState<{ text: string, userId: number } | null>(null);

  // Refs
  const questionStartTime = useRef<number>(Date.now());
  const processingFinish = useRef(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // 1. Música de Fondo
  useEffect(() => {
    const audio = new Audio('/assets/sounds/fondoBatalla.webm');
    audio.loop = true;
    audio.volume = 0.2;
    bgMusicRef.current = audio;

    const playMusic = async () => {
      try {
        if (gameState !== 'FINISHED') await audio.play();
      } catch (error) {
        console.warn("Autoplay bloqueado:", error);
      }
    };
    playMusic();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // 2. Temporizador
  useEffect(() => {
    let interval: any;
    if (gameState === 'PLAYING' && gameTimeLeft > 0) {
      interval = setInterval(() => {
        setGameTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, gameTimeLeft]);

  // 3. Lógica de Inicio y Sockets
  useEffect(() => {
    if (!matchData && gameState !== 'FINISHED' && !processingFinish.current) {
      navigate('/pvp');
    }
  }, [matchData, navigate, gameState]);

  useEffect(() => {
    if (!matchData) return;
    const startTimestamp = new Date(matchData.startTime).getTime();
    const now = Date.now();
    const delay = Math.max(0, startTimestamp - now);
    setCountdown(Math.ceil(delay / 1000));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('PLAYING');
          questionStartTime.current = Date.now();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchData]);

  useEffect(() => {
    if (!socket) return;

    const handleAnswerResult = (data: { correct: boolean, points: number }) => {
      setIsSubmitting(false);
      setIsAnswerCorrect(data.correct);
      if (data.correct) setMyScore((prev) => prev + data.points);
      setTimeout(() => handleNextQuestion(), 1500);
    };

    const handleOpponentAction = (data: { type: string, newScore?: number }) => {
      if (data.type === 'answer_correct' && data.newScore !== undefined) {
        setOpponentScore(data.newScore);
      }
    };

    const handleMatchFinished = (results: any) => {
      if (processingFinish.current) return;
      processingFinish.current = true;
      setGameState('FINISHED');

      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }

      setTimeout(() => {
        navigate(`/pvp/results/${matchData?.matchId}`, { state: results });
        clearMatchData();
      }, 2000);
    };

    const handleOpponentEmote = (data: { emoji: string }) => {
      if (matchData) showFloatingEmote(data.emoji, matchData.opponent.id);
    };

    socket.on('answer_result', handleAnswerResult);
    socket.on('opponent_action', handleOpponentAction);
    socket.on('match_finished', handleMatchFinished);
    socket.on('opponent_emote', handleOpponentEmote);

    return () => {
      socket.off('answer_result', handleAnswerResult);
      socket.off('opponent_action', handleOpponentAction);
      socket.off('match_finished', handleMatchFinished);
      socket.off('opponent_emote', handleOpponentEmote);
    };
  }, [socket, navigate, matchData, clearMatchData]);

  // Helpers
  const showFloatingEmote = (emoji: string, userId: number) => {
    setActiveEmote({ text: emoji, userId });
    setTimeout(() => setActiveEmote(null), 2000);
  };

  const handleSendEmote = (emoji: string) => {
    if (!user || !matchData) return;
    showFloatingEmote(emoji, user.id);
    socket?.emit('send_emote', { matchId: matchData.matchId, emoji });
  };

  const handleOptionClick = (option: string) => {
    if (isSubmitting || isAnswerCorrect !== null || !matchData || gameState !== 'PLAYING') return;

    setSelectedOption(option);
    setIsSubmitting(true);

    const timeTaken = Date.now() - questionStartTime.current;
    const currentQuestion = matchData.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    socket?.emit('submit_answer', {
      questionId: currentQuestion.id,
      answer: option,
      timeTaken
    });
  };

  const handleNextQuestion = useCallback(() => {
    if (!matchData) return;
    if (currentQuestionIndex < matchData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerCorrect(null);
      setIsSubmitting(false);
      questionStartTime.current = Date.now();
    }
  }, [matchData, currentQuestionIndex]);

  return {
    gameState,
    countdown,
    currentQuestionIndex,
    gameTimeLeft,
    myScore,
    opponentScore,
    selectedOption,
    isAnswerCorrect,
    isSubmitting,
    activeEmote,
    matchData,
    user,
    handlers: {
      handleOptionClick,
      handleSendEmote
    }
  };
};