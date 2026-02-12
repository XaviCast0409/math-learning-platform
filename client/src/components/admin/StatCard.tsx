import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: string;
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-800">{value}</h3>
                {trend && (
                    <p className="text-xs text-green-500 font-bold mt-1 flex items-center">
                        <TrendingUp size={12} className="mr-1" /> {trend}
                    </p>
                )}
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                {icon}
            </div>
        </div>
    );
}
