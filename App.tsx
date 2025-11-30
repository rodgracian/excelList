
import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, LayoutGrid, Shield, User as UserIcon } from 'lucide-react';
import Workspace from './components/Workspace';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { authService } from './services/auth';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'admin' | 'profile'>('workspace');

  useEffect(() => {
    // Check for active session on load
    const session = authService.getSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('workspace'); // Reset to workspace on login
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-5xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Excel List Agent
                </h1>
                <p className="text-sm text-slate-500">
                  Hola, <span className="font-medium text-slate-900">{currentUser.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
              <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === 'workspace' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Workspace</span>
                </button>
                
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                      activeTab === 'admin' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === 'profile' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              {activeTab === 'workspace' 
                ? 'Procesamiento inteligente de inventarios con exportación a PDF.'
                : activeTab === 'admin'
                ? 'Panel de control de usuarios y seguridad.'
                : 'Gestiona tu información personal y credenciales.'}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {activeTab === 'workspace' && <Workspace />}
          
          {activeTab === 'admin' && (
             <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
                {currentUser.role === 'admin' ? <AdminPanel /> : <div className="text-center text-red-500">Acceso Denegado</div>}
             </div>
          )}

          {activeTab === 'profile' && (
            <UserProfile user={currentUser} onUserUpdate={handleUserUpdate} />
          )}
        </div>
          
        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Sesión iniciada como <span className="font-medium">{currentUser.email}</span> • {currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;