import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Rocket, Phone, Calendar, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../api/auth.api';
import { toast } from 'react-hot-toast';

// Componentes XaviUI
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { GlobalLoading } from '../../../components/common/GlobalLoading';
import { OTPInput } from '../../../components/common/OTPInput';
import { GradeSelect } from '../components/GradeSelect';

type RegisterFormInputs = {
  username: string;
  email: string;
  password: string;
  full_name: string;
  age?: number;
  phone?: string;
  grade_level: string;
};

export default function Register() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    control
  } = useForm<RegisterFormInputs>();

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Load email from localStorage if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('pending_verification_email');
    if (savedEmail) {
      setRegisteredEmail(savedEmail);
      setStep(3);
    }
  }, []);

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormInputs)[] = [];

    if (step === 1) {
      fieldsToValidate = ['username', 'email', 'password'];
    } else if (step === 2) {
      fieldsToValidate = ['full_name', 'grade_level'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 2) {
        // Submit registration
        await handleRegister();
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    setServerError(null);
    setStep(step - 1);
  };

  const handleRegister = async () => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const formData = getValues();
      await authApi.register(formData);

      // Save email to localStorage
      localStorage.setItem('pending_verification_email', formData.email);
      setRegisteredEmail(formData.email);
      setStep(3);
      setCountdown(60); // 1 minute cooldown for resend
      toast.success('📧 Código enviado a tu correo');
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg?.includes('users_email_key') || msg?.includes('ya está registrado')) {
        setServerError('¡Ese correo ya está registrado! Intenta iniciar sesión.');
      } else if (msg?.includes('users_username_key') || msg?.includes('ya está en uso')) {
        setServerError('¡Ese nombre de usuario ya existe! Elige otro más original.');
      } else {
        setServerError(msg || 'Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleVerifyCode = async () => {
    if (otpCode.length !== 4) {
      setOtpError(true);
      return;
    }

    setIsVerifying(true);
    setOtpError(false);

    try {
      const response = await authApi.verifyEmail(registeredEmail, otpCode);

      // Show success state
      setVerificationSuccess(true);
      toast.success('¡Código verificado! 🎉');

      // Wait 1.5 seconds to show success animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear localStorage
      localStorage.removeItem('pending_verification_email');

      // Set session with user and token
      setSession(response.data.user, response.data.token);
      toast.success('¡Bienvenido a XaviMath!');
      navigate('/learn');
    } catch (error: any) {
      setOtpError(true);
      setVerificationSuccess(false);
      const msg = error.response?.data?.message;
      toast.error(msg || 'Código incorrecto');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsSubmitting(true);
    try {
      await authApi.resendCode(registeredEmail);
      setCountdown(60);
      toast.success('Código reenviado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reenviar código');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit OTP when complete
  useEffect(() => {
    if (otpCode.length === 4 && step === 3) {
      handleVerifyCode();
    }
  }, [otpCode]);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* Loading Global Overlay */}
      {isSubmitting && <GlobalLoading />}

      {/* Fondo Decorativo */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(#22C55E 2px, transparent 2px)', backgroundSize: '25px 25px' }}>
      </div>

      <Card className="w-full max-w-md relative z-10">

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-black text-sm
                transition-all duration-300
                ${step >= s
                  ? 'bg-brand-green text-white border-2 border-black shadow-retro-sm'
                  : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                }
              `}>
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-brand-green' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-brand-green text-white p-4 rounded-2xl border-2 border-black shadow-retro mb-4">
            <Rocket size={40} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">
            {step === 1 && '¡Únete a la Aventura!'}
            {step === 2 && 'Cuéntanos sobre ti'}
            {step === 3 && 'Verifica tu Email'}
          </h1>
          <p className="text-gray-600 font-medium text-sm">
            {step === 1 && 'Crea tu cuenta y empieza a ganar xavicoins 💰'}
            {step === 2 && 'Solo un paso más para comenzar'}
            {step === 3 && `Código enviado a ${registeredEmail}`}
          </p>
        </div>

        {/* Mensaje de Error */}
        {serverError && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-brand-red rounded-xl text-brand-red font-bold text-center text-sm">
            ⚠️ {serverError}
          </div>
        )}

        {/* STEP 1: Datos Básicos */}
        {step === 1 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-5">
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
                variant="primary"
                className="w-full bg-brand-green hover:bg-green-500 text-white"
                icon={<ArrowRight size={20} />}
              >
                SIGUIENTE
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Información Personal */}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-5">
            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Ej. Juan Pérez"
              icon={<User size={20} />}
              error={errors.full_name?.message}
              {...register("full_name", {
                required: "Tu nombre completo es necesario",
                minLength: { value: 3, message: "Mínimo 3 caracteres" }
              })}
            />

            <Controller
              name="grade_level"
              control={control}
              rules={{ required: "Selecciona tu año de estudio" }}
              render={({ field }) => (
                <GradeSelect
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.grade_level?.message}
                />
              )}
            />

            <Input
              label="Edad (Opcional)"
              type="number"
              placeholder="Ej. 12"
              icon={<Calendar size={20} />}
              error={errors.age?.message}
              {...register("age", {
                min: { value: 5, message: "Edad mínima: 5 años" },
                max: { value: 100, message: "Edad máxima: 100 años" }
              })}
            />

            <Input
              label="Teléfono (Opcional)"
              type="tel"
              placeholder="Ej. 987654321"
              icon={<Phone size={20} />}
              error={errors.phone?.message}
              {...register("phone", {
                pattern: { value: /^[0-9]{9,15}$/, message: "Formato inválido (9-15 dígitos)" }
              })}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
                icon={<ArrowLeft size={20} />}
              >
                ATRÁS
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-brand-green hover:bg-green-500 text-white"
                icon={<Sparkles size={20} />}
              >
                CREAR CUENTA
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Verificación OTP */}
        {step === 3 && (
          <div className="space-y-6">
            {!verificationSuccess ? (
              <>
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Ingresa el código de 4 dígitos que enviamos a tu correo
                  </p>
                  <OTPInput
                    onChange={(value) => {
                      setOtpCode(value);
                      setOtpError(false);
                    }}
                    error={otpError}
                    disabled={isVerifying || isSubmitting}
                  />

                  {isVerifying && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-brand-blue font-bold animate-pulse">Verificando código...</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || isSubmitting || isVerifying}
                    className={`text-sm font-bold ${countdown > 0 || isVerifying ? 'text-gray-400 cursor-not-allowed' : 'text-brand-blue hover:underline'
                      }`}
                  >
                    {countdown > 0 ? `Reenviar código en ${countdown}s` : '¿No recibiste el código? Reenviar'}
                  </button>
                </div>

                <Button
                  type="button"
                  onClick={handleBack}
                  variant="secondary"
                  className="w-full"
                  icon={<ArrowLeft size={20} />}
                  disabled={isVerifying}
                >
                  VOLVER
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center bg-brand-green text-white p-6 rounded-full border-4 border-black shadow-retro mb-6"
                >
                  <CheckCircle size={64} strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-2xl font-black text-brand-green mb-2">¡Verificado!</h2>
                <p className="text-gray-600 font-medium">Redirigiendo a tu cuenta...</p>
              </div>
            )}
          </div>
        )}

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