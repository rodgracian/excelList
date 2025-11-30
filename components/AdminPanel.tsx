
import React, { useState, useEffect } from 'react';
import { Trash2, Shield, User as UserIcon, RefreshCw, Plus, Save } from 'lucide-react';
import { authService } from '../services/auth';
import { User } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' as const });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        authService.deleteUser(id);
        loadUsers();
        setSuccess('Usuario eliminado.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (e: any) {
        setError(e.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleResetPassword = (id: string) => {
    const newPass = prompt('Ingresa la nueva contraseña:');
    if (newPass) {
      authService.resetPassword(id, newPass);
      setSuccess('Contraseña actualizada.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authService.createUser(newUser.email, newUser.name, newUser.role, newUser.password);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setIsAdding(false);
      loadUsers();
      setSuccess('Usuario creado exitosamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {isAdding ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Usuario</>}
        </button>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-lg text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || success}
        </div>
      )}

      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl animate-in slide-in-from-top-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Agregar Nuevo Usuario</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre Completo"
              required
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              required
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
            />
             <input
              type="password"
              placeholder="Contraseña"
              required
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as 'user' | 'admin'})}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                <Save className="w-4 h-4" /> Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                         {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      title="Reiniciar Contraseña"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {user.email !== 'rodrigoggracian@gmail.com' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Eliminar Usuario"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
