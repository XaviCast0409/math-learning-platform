interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

export const TextInput = ({ value, onChange, disabled }: Props) => {
  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-3xl border-4 border-gray-200 text-center shadow-sm">
         <input 
           type="text" 
           value={value}
           onChange={(e) => onChange(e.target.value)}
           disabled={disabled}
           placeholder="Escribe tu respuesta..."
           className="w-full text-center text-3xl font-black text-gray-800 focus:outline-none placeholder:text-gray-300 bg-transparent border-b-4 border-gray-200 focus:border-brand-blue transition-colors py-2"
           autoFocus
         />
      </div>
    </div>
  );
};