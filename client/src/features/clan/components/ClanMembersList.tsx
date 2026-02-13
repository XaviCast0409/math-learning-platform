import { User, Trash2, Crown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; // Para saber quién soy
import { type ClanMember } from '../api/clan.api';

interface Props {
	members: ClanMember[];
	ownerId: number;
	onKick: (id: number) => void;
}

export const ClanMembersList = ({ members, ownerId, onKick }: Props) => {
	const { user } = useAuth(); // Mi usuario actual
	const amILeader = user?.id === ownerId;

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			<div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
				<h3 className="font-bold text-gray-700 flex items-center gap-2">
					<User size={18} /> MIEMBROS ({members.length})
				</h3>
			</div>

			<div className="divide-y divide-gray-100">
				{members.map((member) => (
					<div key={member.id} className="p-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							{/* Avatar / Icono */}
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-brand-blue font-bold text-sm">
								{member.username.substring(0, 2).toUpperCase()}
							</div>

							<div>
								<div className="flex items-center gap-2">
									<p className="font-bold text-gray-800 text-sm">{member.username}</p>
									{member.id === ownerId && (
										<Crown size={14} className="text-yellow-500 fill-yellow-500" />
									)}
								</div>
								<p className="text-xs text-gray-400 font-medium">
									{member.elo_rating} Copas • {member.role}
								</p>
							</div>
						</div>

						{/* Acciones (Solo si soy líder y NO es el dueño) */}
						{amILeader && member.id !== ownerId && (
							<button
								onClick={() => onKick(member.id)}
								className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
								title="Expulsar"
							>
								<Trash2 size={16} />
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
};