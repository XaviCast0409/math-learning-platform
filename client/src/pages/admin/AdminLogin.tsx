import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';

// Componentes
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export default function AdminLogin() {
	const navigate = useNavigate();
	const { setSession } = useAuth();

	const [error, setError] = useState<string | null>(null);
	const { register, handleSubmit, formState: { isSubmitting } } = useForm();

	const onSubmit = async (data: any) => {
		try {
			setError(null);

			// 1. Llamada a la API
			// 'response' es de tipo AuthResponse
			const response = await authApi.loginAdmin(data);

			// 2. Extraer datos según tu interfaz EXACTA:
			// AuthResponse = { token: string, data: { user: User } }
			// ✅ Correcto para Admin
			const token = response.token;
			const user = response.user;

			// 3. Guardar sesión en Contexto
			setSession(user, token);

			// 4. Redirigir
			navigate('/admin/dashboard');

		} catch (err: any) {
			console.error(err);
			// Manejo de error seguro
			const msg = err.response?.data?.message || 'Credenciales inválidas o acceso denegado';
			setError(msg);
		}
	};

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

			<div className="absolute inset-0 opacity-20"
				style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
			</div>

			<Card className="w-full max-w-sm relative z-10 border-slate-700 bg-slate-800 text-white shadow-2xl">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center bg-red-500/10 text-red-500 p-4 rounded-full mb-4 border border-red-500/50 animate-pulse">
						<ShieldCheck size={40} />
					</div>
					<h1 className="text-2xl font-black text-white tracking-widest uppercase">Admin Panel</h1>
					<p className="text-slate-400 text-xs mt-2 font-mono">Restricted Access Level 5</p>
				</div>

				{error && (
					<div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-xs font-mono flex items-center gap-2">
						<AlertTriangle size={14} /> {error}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Admin Email</label>
						<input
							{...register("email", { required: true })}
							type="email"
							className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
							placeholder="admin@xaviplay.com"
						/>
					</div>

					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Secure Password</label>
						<input
							{...register("password", { required: true })}
							type="password"
							className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors font-mono"
							placeholder="••••••••••••"
						/>
					</div>

					<Button
						type="submit"
						variant="danger"
						className="w-full font-mono tracking-widest"
						disabled={isSubmitting}
						icon={<Lock size={16} />}
					>
						{isSubmitting ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
					</Button>
				</form>

				<div className="mt-8 pt-6 border-t border-slate-700 text-center">
					<button onClick={() => navigate('/login')} className="text-slate-500 hover:text-white text-xs font-mono transition-colors">
						← Return to Student Portal
					</button>
				</div>
			</Card>
		</div>
	);
}