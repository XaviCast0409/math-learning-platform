import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// Importamos componentes XaviUI
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { StreakModal } from '../../../components/gamification/StreakModal';

import { ShieldAlert } from 'lucide-react';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  // Estado para guardar la recompensa si existe
  const [streakReward, setStreakReward] = useState<any | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      // Temporizador visual de 3 segundos
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3000));

      // Ejecutamos login y temporizador en paralelo
      // 'response' recibirá lo que devuelva la función login() del AuthContext
      const [response] = await Promise.all([
        login(data),
        minLoadingTime
      ]);

      // Verificamos si la respuesta trae una recompensa por racha
      // (Asegúrate de haber actualizado el AuthContext como vimos en el paso anterior)
      if (response && response.data.streak_reward) {
        setStreakReward(response.data.streak_reward);
        // No navegamos todavía, esperamos a que el usuario cierre el modal
      } else {
        navigate('/learn');
      }

    } catch (error: any) {
      console.error(error);
      // Manejo seguro del mensaje de error
      const msg = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      setServerError(msg);
    }
  };

  const handleCloseReward = () => {
    setStreakReward(null);
    navigate('/learn');
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* 1. Loading Global: Bloquea la pantalla mientras carga */}
      {isSubmitting && <GlobalLoading />}

      {/* 2. Modal de Racha: Aparece si hay recompensa */}
      {streakReward && (
        <StreakModal
          reward={streakReward}
          onClose={handleCloseReward}
        />
      )}

      {/* Fondo Decorativo */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(#4F46E5 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
      </div>

      <Card className="w-full max-w-md relative z-10">

        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-brand-blue text-white p-4 rounded-2xl border-2 border-black shadow-retro mb-4">
            <Gamepad2 size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight mb-2">XaviPlay</h1>
          <p className="text-gray-600 font-medium">¡Bienvenido de vuelta, genio! 🧠</p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-brand-red rounded-xl text-brand-red font-bold text-center text-sm">
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail size={20} />}
            error={errors.email?.message}
            {...register("email", { required: "El correo es obligatorio" })}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••"
            icon={<Lock size={20} />}
            error={errors.password?.message}
            {...register("password", { required: "Ingresa tu contraseña" })}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
            icon={<ArrowRight strokeWidth={3} />}
          >
            ENTRAR
          </Button>

        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-brand-blue font-black hover:underline decoration-2 underline-offset-2">
              Crear Cuenta
            </Link>
          </p>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-red transition-colors uppercase tracking-widest"
          >
            <ShieldAlert size={14} />
            Acceso Administrativo
          </Link>
        </div>

      </Card>

      {/* Decoración Flotante */}
      <div className="absolute top-10 left-10 text-indigo-200 animate-bounce delay-700 hidden md:block">
        <span className="text-6xl font-black">x²</span>
      </div>
    </div>
  );
}