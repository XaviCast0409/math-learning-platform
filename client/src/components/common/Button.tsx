import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilidad para unir clases sin conflictos
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button = ({ 
  className, 
  variant = 'primary', 
  isLoading, 
  icon,
  children, 
  disabled,
  ...props 
}: ButtonProps) => {
  
  // Estilos base compartidos
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-lg rounded-xl border-2 border-black transition-all disabled:opacity-70 disabled:cursor-not-allowed active:translate-y-[2px] active:translate-x-[2px] active:shadow-retro-sm";

  // Variantes de color
  const variants = {
    primary: "bg-brand-yellow text-black shadow-retro hover:bg-brand-yellowHover",
    secondary: "bg-brand-blue text-white shadow-retro hover:bg-indigo-700",
    danger: "bg-brand-red text-white shadow-retro hover:bg-red-600",
    outline: "bg-white text-black shadow-retro hover:bg-gray-50",
    // 👇 2. DEFINIMOS EL ESTILO PARA 'ghost'
    // (Usualmente sin borde, sin sombra inicial y fondo transparente)
    ghost: "bg-transparent text-gray-500 border-transparent shadow-none hover:bg-gray-100 hover:text-gray-700 active:shadow-none active:translate-y-0 active:translate-x-0",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : icon}
      {children}
    </button>
  );
};