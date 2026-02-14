import { AvatarSprite } from '../../avatar/AvatarSprite';
import type { AvatarConfig } from '../../types/avatar.types'; // Ajusta ruta
import type { User } from '../../types'; // Import User type

interface Props {
  user: User | null;
  leagueName: string;
  currentAvatar: AvatarConfig;
  onOpenWardrobe: () => void;
}

export const UserIdentityCard = ({ user, leagueName, currentAvatar }: Props) => {
  return (
    <div className="bg-white border-2 border-black rounded-3xl p-4 shadow-retro mb-4 relative overflow-hidden group">
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow rounded-full mix-blend-multiply filter blur-2xl opacity-20 translate-x-10 -translate-y-10"></div>

      <div className="flex flex-col items-center relative z-10">

        {/* Contenedor del Avatar */}
        <div className="relative mb-3 p-3">
          <div className="absolute inset-0 bg-brand-yellow rounded-full scale-90 border-4 border-black/10"></div>

          <div className="relative z-10 w-24 h-24 flex items-center justify-center left-5">
            <AvatarSprite config={currentAvatar} scale={1.8} />
          </div>

          <div className="absolute top-0 -left-10 bg-brand-red text-white text-xs font-black px-2 py-1 rounded-md border-2 border-black -rotate-12 shadow-sm">
            LVL {user?.level}
          </div>
        </div>

        <h2 className="text-2xl font-black leading-none mb-1 text-center">{user?.username}</h2>
        {/* Full Name */}
        {user?.full_name && (
          <p className="text-sm font-bold text-gray-400 mb-2">{user.full_name}</p>
        )}

        <div className="flex gap-2 mt-1">
          <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded-md border border-gray-300 text-gray-500 uppercase">
            {leagueName}
          </span>
          {user?.grade_level && (
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 rounded-md border border-blue-200 text-blue-500 uppercase">
              {user.grade_level.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};