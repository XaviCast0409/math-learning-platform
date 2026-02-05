import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // 👈 CAMBIO 1: Agregamos '?' para que sea opcional
  error?: string;
  icon?: ReactNode;
  containerClass?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, containerClass, ...props }, ref) => {
    return (
      <div className={cn("w-full space-y-1", containerClass)}>
        
        {/* 👇 CAMBIO 2: Solo mostramos la etiqueta si existe 'label' */}
        {label && (
          <label className="block text-sm font-bold text-gray-700 ml-1">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              "w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-lg rounded-xl py-3",
              "focus:outline-none focus:border-brand-blue focus:bg-white transition-all",
              "placeholder:text-gray-400 font-medium",
              icon ? "pl-12 pr-4" : "px-4",
              error ? "border-brand-red bg-red-50 focus:border-brand-red" : "",
              className
            )}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-brand-red text-xs font-bold ml-1 animate-pulse">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';