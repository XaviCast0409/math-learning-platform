import { useState } from 'react';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { X, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pass: string) => Promise<void>;
  username: string;
}

import { toast } from 'react-hot-toast';

export const ChangePasswordModal = ({ isOpen, onClose, onSubmit, username }: Props) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // ...

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Mínimo 6 caracteres");

    setLoading(true);
    await onSubmit(password);
    setLoading(false);
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Lock size={16} /> Cambiar Contraseña
          </h3>
          <button onClick={onClose} className="hover:text-red-400 transition-colors"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Estás cambiando la contraseña para el usuario: <strong className="text-black">{username}</strong>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nueva Contraseña"
              type="text" // Visible para que el admin vea qué escribe
              placeholder="Escribe la nueva clave..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading || !password}>
                {loading ? 'Guardando...' : 'Actualizar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
