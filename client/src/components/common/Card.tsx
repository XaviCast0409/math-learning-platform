import type { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string; // Opcional: Si quieres un título pre-estilizado
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={cn(
      "bg-white border-4 border-black rounded-3xl p-6 shadow-retro relative z-10",
      className
    )}>
      {title && (
        <h2 className="text-2xl font-black text-center mb-6">{title}</h2>
      )}
      {children}
    </div>
  );
};