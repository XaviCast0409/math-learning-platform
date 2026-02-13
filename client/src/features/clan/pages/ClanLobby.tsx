import { motion } from 'framer-motion';
import { Shield, Plus, Search, Users, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClan } from '../hooks/useClan';
import { Button } from '../../../components/common/Button';

import { ClanMembersList } from '../components/ClanMembersList';
import { ClanWarWidget } from '../components/ClanWarWidget';
import { PendingChallenges } from '../components/PendingChallenges';
import { ClanEmblem } from '../components/ClanEmblem'; // 👈 IMPORTAR

export default function ClanLobby() {
	const { myClan, loading, actions, warStatus, pendingWars } = useClan();
	const navigate = useNavigate();

	if (loading) return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
			<Loader2 size={48} className="text-brand-blue animate-spin mb-4" />
			<p className="text-gray-400 font-bold text-sm tracking-widest animate-pulse">
				CARGANDO CLAN...
			</p>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50 pb-24">
			{/* --- HEADER --- */}
			<header className="bg-white sticky top-0 z-20 shadow-sm p-4">
				<div className="max-w-md mx-auto flex justify-between items-center">
					<h1 className="text-xl font-black text-gray-800 italic tracking-tight flex items-center gap-2">
						<Shield className="text-brand-blue fill-brand-blue/20" /> CLAN
					</h1>

					<button
						onClick={() => navigate('/clan/browser')}
						className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-brand-blue hover:text-white transition-colors"
						title="Buscar otros clanes"
					>
						<Search size={20} />
					</button>
				</div>
			</header>

			<div className="max-w-md mx-auto p-4 space-y-6">

				{/* CASO A: NO TIENE CLAN */}
				{!myClan && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-10 space-y-6"
					>
						<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
							<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Users size={40} className="text-gray-400" />
							</div>
							<h2 className="text-2xl font-bold text-gray-800 mb-2">Únete a la batalla</h2>
							<p className="text-gray-500 mb-6 text-sm">
								Jugar en equipo es mejor. Únete a un clan para participar en guerras, ganar recompensas extra y hacer amigos.
							</p>

							<div className="w-full space-y-3">
								<Button variant="primary" className="w-full" onClick={() => navigate('/clan/browser')} icon={<Search size={18} />}>
									BUSCAR UN CLAN
								</Button>
								<Button variant="outline" className="w-full" onClick={() => navigate('/clan/create')} icon={<Plus size={18} />}>
									CREAR MI PROPIO CLAN
								</Button>
							</div>
						</div>
					</motion.div>
				)}

				{/* CASO B: TIENE CLAN */}
				{myClan && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="space-y-6"
					>
						{/* 1. Tarjeta Resumen de Mi Clan */}
						<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">

							{/* Fondo decorativo con tu emblema (difuminado) */}
							<div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none grayscale">
								<ClanEmblem emblemId={myClan.emblem_id} className="w-48 h-48 border-none bg-transparent shadow-none" />
							</div>

							{/* Cabecera: Emblema, Nombre y Nivel */}
							<div className="flex items-center gap-4 mb-6 relative z-10">
								{/* 👇 Emblema Principal */}
								<ClanEmblem
									emblemId={myClan.emblem_id}
									className="w-16 h-16 border-2 border-gray-100 shadow-sm shrink-0"
								/>

								<div className="flex-1 min-w-0">
									<h2 className="text-2xl font-black text-gray-800 tracking-tight leading-none truncate">
										{myClan.name}
									</h2>
									<p className="text-xs text-gray-400 font-medium mt-1 line-clamp-1">
										{myClan.description || "Sin descripción"}
									</p>
								</div>

								{/* Badge de Nivel */}
								<div className="flex flex-col items-center justify-center bg-blue-50 w-12 h-12 rounded-xl border border-blue-100 shadow-sm shrink-0">
									<span className="text-[10px] text-brand-blue font-bold uppercase">Nvl</span>
									<span className="text-xl font-black text-brand-blue leading-none">{myClan.level}</span>
								</div>
							</div>

							{/* Barra de Experiencia (XP) */}
							<div className="relative z-10">
								<div className="flex justify-between items-end mb-1">
									<span className="text-xs font-bold text-gray-400 uppercase">Progreso del Clan</span>
									<span className="text-xs font-black text-gray-800">
										{myClan.total_xp.toLocaleString()} XP
									</span>
								</div>

								<div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${(myClan as any).progress_percent || 15}%` }}
										transition={{ duration: 1.5, ease: "easeOut" }}
										className="h-full bg-gradient-to-r from-blue-400 to-brand-blue rounded-full relative"
									>
										<div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
									</motion.div>
								</div>

								<p className="text-[10px] text-gray-400 mt-2 text-right">
									Siguiente nivel: Desbloquea más capacidad
								</p>
							</div>
						</div>

						{/* 1.5. RETOS PENDIENTES */}
						{pendingWars.length > 0 && (
							<PendingChallenges
								challenges={pendingWars}
								onRespond={actions.respondChallenge}
							/>
						)}

						{/* 2. ESTADO DE GUERRA */}
						<section>
							<h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Campo de Batalla</h3>
							<ClanWarWidget war={warStatus} />
						</section>

						{/* 3. LISTA DE MIEMBROS */}
						<section>
							<ClanMembersList
								members={myClan.members || []}
								ownerId={myClan.owner_id}
								onKick={actions.kickMember}
							/>
						</section>

						{/* Botón Salir */}
						<div className="pt-4 pb-8">
							<Button
								variant="outline"
								className="w-full border-red-100 text-red-500 hover:bg-red-50 shadow-none"
								onClick={actions.leaveClan}
								icon={<LogOut size={16} />}
							>
								Abandonar Clan
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}

