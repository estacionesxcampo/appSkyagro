'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Phone, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al registrarse');
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      setLoading(false);
      // Opcional: Redirigir al login después de un par de segundos
      setTimeout(() => {
        router.push('/login');
      }, 4000);

    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors bg-cover bg-center bg-no-repeat relative" 
      style={{ backgroundImage: 'url("/fondologin.png")' }}
    >
      {/* Overlay oscuro para asegurar que el texto y el formulario se lean perfecto */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-2">
          <img 
            src="https://skyagro.s3.us-east-1.amazonaws.com/logo.png" 
            alt="SkyAGRO Logo" 
            className="h-16 w-auto object-contain drop-shadow-lg" 
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-green-100 font-medium drop-shadow-sm">
          Únete a SkyAGRO para monitorear tu clima
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl shadow-black/40 sm:rounded-2xl sm:px-10 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">{success} Redirigiendo...</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nombre Completo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 outline-none border transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo Electrónico
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 outline-none border transition-colors"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 outline-none border transition-colors"
                  placeholder="+595 9xx xxx xxx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 outline-none border transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
