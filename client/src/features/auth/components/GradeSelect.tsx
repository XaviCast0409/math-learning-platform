import { GraduationCap } from 'lucide-react';
import { forwardRef } from 'react';

interface GradeSelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const gradeOptions = [
    { value: '4to_primaria', label: '4to Primaria' },
    { value: '5to_primaria', label: '5to Primaria' },
    { value: '6to_primaria', label: '6to Primaria' },
    { value: '1ro_secundaria', label: '1ro Secundaria' },
    { value: '2do_secundaria', label: '2do Secundaria' },
    { value: '3ro_secundaria', label: '3ro Secundaria' },
    { value: '4to_secundaria', label: '4to Secundaria' },
    { value: '5to_secundaria', label: '5to Secundaria' },
];

export const GradeSelect = forwardRef<HTMLSelectElement, GradeSelectProps>(
    ({ value, onChange, error }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Año de Estudio
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <GraduationCap size={20} />
                    </div>
                    <select
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`
              w-full pl-12 pr-4 py-3 
              border-2 rounded-xl 
              font-bold text-gray-800
              bg-white
              transition-all duration-200
              focus:outline-none focus:ring-4
              ${error
                                ? 'border-brand-red focus:border-brand-red focus:ring-red-200'
                                : 'border-gray-300 focus:border-brand-blue focus:ring-blue-200'
                            }
              hover:border-gray-400
              appearance-none
              cursor-pointer
            `}
                    >
                        <option value="" disabled>
                            Selecciona tu grado...
                        </option>
                        {gradeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-2 text-sm font-bold text-brand-red">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

GradeSelect.displayName = 'GradeSelect';
