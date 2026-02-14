import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
}

export function OTPInput({ length = 4, onChange, disabled = false, error = false }: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [localValues, setLocalValues] = useState<string[]>(Array(length).fill(''));

    // Sync with parent value
    const handleChange = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return; // Only allow digits

        const newValues = [...localValues];
        newValues[index] = digit.slice(-1); // Only take last digit
        setLocalValues(newValues);

        const newValue = newValues.join('');
        onChange(newValue);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !localValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newValues = pastedData.split('').concat(Array(length).fill('')).slice(0, length);
        setLocalValues(newValues);
        onChange(newValues.join(''));

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[lastIndex]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={localValues[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={`
            w-14 h-16 text-center text-3xl font-black
            border-2 rounded-xl
            transition-all duration-200
            focus:outline-none focus:ring-4
            ${error
                            ? 'border-brand-red bg-red-50 focus:border-brand-red focus:ring-red-200'
                            : 'border-gray-300 bg-white focus:border-brand-blue focus:ring-blue-200'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
}
