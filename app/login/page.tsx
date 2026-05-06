'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al iniciar sesión');
        setLoading(false);
        return;
      }

      router.push('/'); // Redirigir al inicio en caso de éxito
      router.refresh();
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
          Bienvenido a SkyAGRO
        </h2>
        <p className="mt-2 text-center text-sm text-green-100 font-medium drop-shadow-sm">
          Inicia sesión en tu cuenta para continuar
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
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 outline-none border transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 cursor-pointer">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ingresar'}
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
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/registro" className="font-medium text-green-600 hover:text-green-500">
                Regístrate ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
