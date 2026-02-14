import { Mail, Phone, Calendar, Cake } from 'lucide-react';
import type { User } from '../../types';

interface Props {
    user: User | null;
}

export const ProfileDetails = ({ user }: Props) => {
    if (!user) return null;

    // Helper para items
    const InfoRow = ({ icon: Icon, label, value, colorClass, bgClass, delay }: any) => (
        <div className={`flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors duration-300 group animate-in slide-in-from-bottom-2 fade-in fill-mode-forwards`} style={{ animationDelay: `${delay}ms` }}>
            {/* Icon Container */}
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>

            {/* Text Content */}
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-800 truncate font-mono tracking-tight">
                    {value || <span className="text-gray-300 italic font-sans font-normal">No especificado</span>}
                </p>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gray-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10">
                <h3 className="text-xs font-black text-gray-300 uppercase mb-6 flex items-center gap-2 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>
                    Detalles Personales
                </h3>

                <div className="space-y-2">
                    <InfoRow
                        icon={Mail}
                        label="Correo Electrónico"
                        value={user.email}
                        colorClass="text-blue-500"
                        bgClass="bg-blue-50"
                        delay={0}
                    />
                    <div className="h-px bg-gray-50 mx-4" /> {/* Divider */}

                    <InfoRow
                        icon={Phone}
                        label="Teléfono Móvil"
                        value={user.phone}
                        colorClass="text-emerald-500"
                        bgClass="bg-emerald-50"
                        delay={100}
                    />
                    <div className="h-px bg-gray-50 mx-4" />

                    <div className="grid grid-cols-2 gap-2">
                        <InfoRow
                            icon={Cake}
                            label="Edad"
                            value={user.age ? `${user.age} años` : null}
                            colorClass="text-purple-500"
                            bgClass="bg-purple-50"
                            delay={200}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Miembro Desde"
                            value={new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}
                            colorClass="text-orange-500"
                            bgClass="bg-orange-50"
                            delay={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
