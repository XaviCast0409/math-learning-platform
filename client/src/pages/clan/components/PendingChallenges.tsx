import { Swords, Check, X } from 'lucide-react';
import { type WarStatus } from '../../../api/clan.api';

interface Props {
	challenges: WarStatus[];
	onRespond: (warId: number, accept: boolean) => void;
}

export const PendingChallenges = ({ challenges, onRespond }: Props) => {
	if (challenges.length === 0) return null;

	return (
		<div className="space-y-2">
			<h3 className="text-xs font-bold text-gray-400 uppercase ml-1">Solicitudes de Guerra</h3>

			{challenges.map(war => (
				<div key={war.warId} className="bg-white p-4 rounded-xl border-l-4 border-yellow-400 shadow-sm flex justify-between items-center animate-pulse-slow">
					<div>
						<div className="flex items-center gap-2 text-yellow-600 font-bold text-xs uppercase mb-1">
							<Swords size={14} /> ¡Te han desafiado!
						</div>
						<h4 className="font-black text-gray-800 text-lg">
							{war.opponent?.name || 'Clan Rival'}
						</h4>
					</div>

					<div className="flex gap-2">
						<button
							onClick={() => onRespond(war.warId, false)}
							className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
						>
							<X size={20} />
						</button>
						<button
							onClick={() => onRespond(war.warId, true)}
							className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-yellow text-black shadow-retro-sm active:translate-y-1 transition-all"
						>
							<Check size={20} strokeWidth={3} />
						</button>
					</div>
				</div>
			))}
		</div>
	);
};