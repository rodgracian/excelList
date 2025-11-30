
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { Save, Lock, User as UserIcon, Camera, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    birthdate: user.birthdate || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const updatedUser = authService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        birthdate: formData.birthdate
      });
      onUserUpdate(updatedUser);
      setMsg({ type: 'success', text: 'Información actualizada correctamente.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // In a real app we would check current password first
      authService.updateUser(user.id, { password: passwordData.newPassword });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {msg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Public Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Información Personal
            </h3>

            <form onSubmit={handleInfoSubmit} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0 group relative">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 text-3xl font-bold uppercase">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.name.charAt(0)
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen de Perfil</label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        className="pl-9 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Lock className="w-5 h-5 text-orange-600" />
              Seguridad
            </h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 mb-4">
                Asegúrate de usar una contraseña segura. No compartas tu contraseña con nadie.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;