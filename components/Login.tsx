
import React, { useState } from 'react';
import { Lock, Mail, Loader2, Sparkles, ArrowLeft, Send } from 'lucide-react';
import { authService } from '../services/auth';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

type ViewState = 'login' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await authService.recoverPassword(email);
      setSuccessMsg(`Se han enviado las instrucciones de recuperación a ${email}`);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async () => {
    setLoading(true);
    try {
        const user = await authService.login('rodrigoggracian@gmail.com');
        onLoginSuccess(user);
    } catch (err) {
        setError('Error en la conexión con Google');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
          Excel List Agent
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {view === 'login' ? 'Inicia sesión para continuar' : 'Recupera el acceso a tu cuenta'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:rounded-lg sm:px-10 border border-slate-200 shadow-sm">
          
          {view === 'login' ? (
            /* LOGIN FORM */
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900">
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
                    className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-900">
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
                    className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                    placeholder="••••••••"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setView('forgot-password');
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100 flex items-center gap-2">
                  <span>•</span> {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
                </button>
              </div>
            </form>
          ) : (
            /* RECOVERY FORM */
            <form className="space-y-6" onSubmit={handleRecoverSubmit}>
              <div>
                <label htmlFor="recovery-email" className="block text-sm font-medium text-slate-900">
                  Correo Electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                    placeholder="Ingresa tu correo registrado"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
                  {successMsg}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {!successMsg && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4"/> Enviar instrucciones</>}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setView('login');
                  }}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al Login
                </button>
              </div>
            </form>
          )}

          {view === 'login' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    O continúa con
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSimulatedGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                >
                   <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.0003 20.45c4.656 0 8.04-3.21 8.04-8.085 0-0.69-.075-1.29-.18-1.695h-7.86v3.255h4.44c-.285 1.77-1.74 3.75-4.44 3.75-2.67 0-4.905-1.8-5.715-4.32-0.21-.66-.33-1.38-.33-2.115s.12-1.455.33-2.115c.81-2.52 3.045-4.32 5.715-4.32 1.455 0 2.73.51 3.735 1.455l2.49-2.49c-1.62-1.5-3.81-2.46-6.225-2.46-4.905 0-9.045 3.3-10.515 7.8-0.345 1.065-.54 2.19-.54 3.36s.195 2.295.54 3.36c1.47 4.5 5.61 7.8 10.515 7.8z" fill="#4285F4" />
                  </svg>
                  <span>Google (Admin Demo)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
