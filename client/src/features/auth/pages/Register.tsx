import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Rocket } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// Componentes XaviUI
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { GlobalLoading } from '../../../components/common/GlobalLoading';

type RegisterFormInputs = {
  username: string;
  email: string;
  password: string;
};

export default function Register() {
  const { register: registerUser } = useAuth(); // Renombramos para no chocar con el register de useForm
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register, // Método de hook-form
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError(null);
    try {
      // 1. Promesa de tiempo mínimo para que se vea la animación cool (3s)
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Ejecutar registro y espera en paralelo
      await Promise.all([
        registerUser(data),
        minLoadingTime
      ]);

      navigate('/learn');
    } catch (error: any) {
      // Manejo de errores comunes del backend
      const msg = error.response?.data?.message;
      if (msg?.includes('users_email_key')) {
        setServerError('¡Ese correo ya está registrado! Intenta iniciar sesión.');
      } else if (msg?.includes('users_username_key')) {
        setServerError('¡Ese nombre de usuario ya existe! Elige otro más original.');
      } else {
        setServerError(msg || 'Ocurrió un error al crear la cuenta.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Loading Global Overlay */}
      {isSubmitting && <GlobalLoading />}

      {/* Fondo Decorativo (Diferente al Login para variar un poco) */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(#22C55E 2px, transparent 2px)', backgroundSize: '25px 25px' }}>
      </div>

      <Card className="w-full max-w-md relative z-10">

        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-brand-green text-white p-4 rounded-2xl border-2 border-black shadow-retro mb-4">
            <Rocket size={40} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">¡Únete a la Aventura!</h1>
          <p className="text-gray-600 font-medium text-sm">Crea tu cuenta y empieza a ganar gemas 💎</p>
        </div>

        {/* Mensaje de Error */}
        {serverError && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-brand-red rounded-xl text-brand-red font-bold text-center text-sm">
            ⚠️ {serverError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <Input
            label="Nombre de Héroe (Usuario)"
            type="text"
            placeholder="Ej. SuperMate3000"
            icon={<User size={20} />}
            error={errors.username?.message}
            {...register("username", {
              required: "Necesitamos saber cómo llamarte",
              minLength: { value: 3, message: "Mínimo 3 letras" },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Solo letras, números y guiones bajos" }
            })}
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail size={20} />}
            error={errors.email?.message}
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" }
            })}
          />

          <Input
            label="Contraseña Secreta"
            type="password"
            placeholder="••••••"
            icon={<Lock size={20} />}
            error={errors.password?.message}
            {...register("password", {
              required: "Crea una contraseña",
              minLength: { value: 6, message: "Mínimo 6 caracteres para estar seguro" }
            })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary" // Usamos el amarillo que ya definimos
              className="w-full bg-brand-green hover:bg-green-500 text-white" // Override manual para hacerlo VERDE (Color de "Inicio")
              disabled={isSubmitting}
              icon={<Sparkles size={20} />}
            >
              ¡COMENZAR MISIÓN!
            </Button>
          </div>

        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 font-medium text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-blue font-black hover:underline decoration-2 underline-offset-2">
              Inicia Sesión aquí
            </Link>
          </p>
        </div>

      </Card>

      {/* Decoración Flotante */}
      <div className="absolute bottom-10 left-10 text-brand-blue animate-bounce delay-100 hidden md:block">
        <span className="text-6xl font-black">+</span>
      </div>
      <div className="absolute top-20 right-20 text-brand-yellow animate-spin-slow hidden md:block">
        <span className="text-6xl font-black">÷</span>
      </div>

    </div>
  );
}