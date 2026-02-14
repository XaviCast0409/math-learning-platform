import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUp, XCircle, Trophy, Home, Skull, Sword } from 'lucide-react';
import type { TowerStatusResponse, TowerAnswerResponse } from '../api/tower.api';
import { Button } from '../../../components/common/Button';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { useState, useEffect } from 'react';

interface Props {
	gameState: TowerStatusResponse;
	onAnswer: (ans: string) => void;
	submitting: boolean;
	lastResult?: TowerAnswerResponse | null;
	onExit: () => void; // ✅ Callback para salir
}

export function TowerGame({ gameState, onAnswer, submitting, lastResult, onExit }: Props) {
	const { run, question } = gameState;
	const [inputAnswer, setInputAnswer] = useState('');
	const [localSubmitting, setLocalSubmitting] = useState(false);

	// Reset input when question changes
	useEffect(() => {
		setInputAnswer('');
		setLocalSubmitting(false);
	}, [question.id]);

	// Mandatory 1s cooldown after answer
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		if (localSubmitting) {
			timeout = setTimeout(() => {
				// Only unlock if parent finished submitting
				if (!submitting) {
					setLocalSubmitting(false);
				}
			}, 1000);
		} else if (!submitting) {
			// If not local submitting but parent finished, ensure unlocked
			setLocalSubmitting(false);
		}

		return () => clearTimeout(timeout);
	}, [localSubmitting, submitting]);

	// Boss Floor Logic
	const isBossFloor = run.current_floor % 5 === 0;
	const bgGradient = isBossFloor
		? 'from-red-900/50 to-black'
		: 'from-blue-900/20 to-purple-900/20';

	// Parseamos opciones si vienen como string JSON
	const options = typeof question.options === 'string'
		? JSON.parse(question.options)
		: question.options;

	// Si no está activa y vidas <= 0, es Game Over
	if (!run.is_active && run.lives_left <= 0) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className="bg-gray-800 p-8 rounded-3xl border-4 border-red-500 shadow-2xl max-w-md w-full"
				>
					<XCircle size={80} className="text-red-500 mx-auto mb-6" />
					<h1 className="text-4xl font-black mb-2 text-red-500">GAME OVER</h1>
					<p className="text-gray-400 text-lg mb-6">Tu ascenso ha terminado.</p>

					<div className="grid grid-cols-2 gap-4 mb-8">
						<div className="bg-gray-900/50 p-4 rounded-xl">
							<p className="text-xs text-gray-400 uppercase font-bold">Piso</p>
							<p className="text-2xl font-black text-white">{run.current_floor}</p>
						</div>
						<div className="bg-gray-900/50 p-4 rounded-xl">
							<p className="text-xs text-gray-400 uppercase font-bold">Puntos</p>
							<p className="text-2xl font-black text-yellow-400">{run.score}</p>
						</div>
						{/* REWARDS */}
						{lastResult?.rewards && (
							<>
								<div className="bg-green-900/30 p-4 rounded-xl border border-green-500/30">
									<p className="text-xs text-green-400 uppercase font-bold">XP Ganada</p>
									<p className="text-2xl font-black text-green-400">+{lastResult.rewards.xp}</p>
								</div>
								<div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30">
									<p className="text-xs text-blue-400 uppercase font-bold">XaviCoins</p>
									<p className="text-2xl font-black text-blue-400">+{lastResult.rewards.gems}</p>
								</div>
							</>
						)}
					</div>

					<Button
						onClick={onExit} // ✅ Usamos el callback
						className="w-full py-4 text-xl font-bold bg-white text-gray-900 hover:bg-gray-200"
					>
						<Home className="mr-2" /> Volver al Inicio
					</Button>
				</motion.div>
			</div>
		);
	}

	const handleSubmitInput = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputAnswer.trim()) return;
		onAnswer(inputAnswer.trim());
	};

	return (
		<div className={`min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden transition-colors duration-1000`}>

			{/* Background Aesthetics */}
			<div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} pointer-events-none`}></div>
			<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

			{/* Header / HUD */}
			<div className={`p-4 flex justify-between items-center bg-gray-800/90 backdrop-blur-md border-b ${isBossFloor ? 'border-red-600' : 'border-gray-700'} sticky top-0 z-30 shadow-lg transition-colors duration-500`}>
				<div className="flex items-center gap-3">
					<div className={`p-2 rounded-xl border ${isBossFloor ? 'bg-red-900/50 border-red-500' : 'bg-purple-900/50 border-purple-500/30'}`}>
						{isBossFloor ? <Skull size={24} className="text-red-500 animate-pulse" /> : <Trophy size={20} className="text-yellow-400" />}
					</div>
					<div>
						<p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isBossFloor ? 'text-red-400' : 'text-gray-400'}`}>
							{isBossFloor ? 'BOSS LEVEL' : 'Piso Actual'}
						</p>
						<div className="flex items-center gap-1">
							<span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isBossFloor ? 'from-red-500 to-orange-500' : 'from-purple-400 to-pink-400'}`}>
								{run.current_floor}
							</span>
							<ArrowUp size={16} className={`${isBossFloor ? 'text-orange-500' : 'text-green-400'} animate-pulse`} />
						</div>
					</div>
				</div>

				<div className="flex gap-1 bg-gray-900/50 p-2 rounded-full border border-gray-700">
					{[...Array(3)].map((_, i) => (
						<motion.div
							key={i}
							initial={false}
							animate={{
								scale: i < run.lives_left ? 1 : 0.8,
								opacity: i < run.lives_left ? 1 : 0.3
							}}
						>
							<Heart
								size={24}
								className={i < run.lives_left ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-gray-600"}
							/>
						</motion.div>
					))}
				</div>
			</div>

			{/* Game Area */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto z-10">

				<AnimatePresence mode='wait'>
					<motion.div
						key={question.id}
						initial={{ x: 50, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -50, opacity: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="w-full flex flex-col gap-6"
					>
						{/* Question Card */}
						<div className={`bg-white text-gray-900 rounded-3xl p-6 md:p-10 shadow-2xl border-b-8 ${isBossFloor ? 'border-red-500 ring-4 ring-red-500/20' : 'border-gray-300'} min-h-[160px] flex items-center justify-center text-center relative overflow-hidden transition-all duration-500`}>
							<div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isBossFloor ? 'from-red-600 via-orange-500 to-yellow-500' : 'from-blue-400 via-purple-400 to-pink-400'}`}></div>

							<div className="text-xl md:text-3xl font-bold text-gray-800 leading-relaxed">
								<Latex>{question.prompt}</Latex>
							</div>

							{isBossFloor && (
								<div className="absolute -right-6 -bottom-6 transform -rotate-12 opacity-10">
									<Skull size={100} className="text-red-600" />
								</div>
							)}
						</div>

						{/* Input Area (Fill-in) vs Options Grid (Choice) */}
						{question.type === 'fill_in' ? (
							<form onSubmit={(e) => {
								if (submitting || localSubmitting) {
									e.preventDefault();
									return;
								}
								setLocalSubmitting(true);
								handleSubmitInput(e);
							}} className="w-full flex flex-col gap-4">
								<div className="relative">
									<input
										type="text"
										value={inputAnswer}
										onChange={(e) => setInputAnswer(e.target.value)}
										placeholder="Escribe tu respuesta..."
										className="w-full p-6 text-2xl font-bold text-center bg-gray-800 border-2 border-gray-600 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all placeholder-gray-600 text-white"
										autoFocus
										disabled={submitting || localSubmitting}
									/>
									<div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-bold">
										ENTER ↵
									</div>
								</div>
								<Button
									type="submit"
									disabled={submitting || !inputAnswer || localSubmitting}
									variant={isBossFloor ? "danger" : "primary"}
									className="w-full py-4 text-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{submitting || localSubmitting ? 'Verificando...' : 'Enviar Respuesta'} <Sword className="ml-2" size={20} />
								</Button>
							</form>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Object.entries(options || {}).map(([key, val]: any, idx) => (
									<Button
										key={idx}
										onClick={() => {
											if (submitting || localSubmitting) return; // Prevent multiple clicks
											setLocalSubmitting(true);
											onAnswer(key);
										}}
										disabled={submitting || localSubmitting}
										variant="secondary"
										className={`w-full py-6 text-lg md:text-xl font-bold border-2 border-gray-700 bg-gray-800 text-white hover:bg-gray-700 ${isBossFloor ? 'hover:border-red-500 hover:text-red-400' : 'hover:border-purple-500 hover:text-purple-400'} transition-all transform hover:-translate-y-1 active:translate-y-0 rounded-2xl shadow-lg flex items-center justify-start px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
									>
										<span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${isBossFloor ? 'bg-red-900/50 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
											{String.fromCharCode(65 + idx)}
										</span>
										<span className="truncate w-full text-left">
											<Latex>{val}</Latex>
										</span>
									</Button>
								))}
							</div>
						)}

					</motion.div>
				</AnimatePresence>

			</div>
		</div>
	);
}
