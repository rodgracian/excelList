
import { User, UserRole } from '../types';

const STORAGE_KEY_USERS = 'excel_agent_users';
const STORAGE_KEY_SESSION = 'excel_agent_session';

// Initialize default admin if not exists
const initialize = () => {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  if (!usersStr) {
    const defaultAdmin: User = {
      id: 'admin-1',
      email: 'rodrigoggracian@gmail.com',
      name: 'Rodrigo Gracian',
      role: 'admin',
      password: 'admin123' // Default password
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([defaultAdmin]));
  }
};

initialize();

export const authService = {
  login: async (email: string, password?: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    // Special bypass for "Google Login Simulation" for the admin
    if (!password && email === 'rodrigoggracian@gmail.com') {
       const admin = users.find(u => u.email === email);
       if (admin) {
         localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(admin));
         return admin;
       }
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getSession: (): User | null => {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  recoverPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email);
    
    // In a real app, we wouldn't reveal if the email exists for security,
    // but for this simulation, we'll check it to simulate logic.
    if (!user) {
      throw new Error('No encontramos un usuario con este correo electrónico.');
    }
    
    // Here we would send the email in a real backend
    return; 
  },

  // Admin Methods
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  createUser: (email: string, name: string, role: UserRole, password: string) => {
    const users = authService.getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('El usuario ya existe');
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      password
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id: string, data: Partial<User>): User => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Check email uniqueness if email is being changed
    if (data.email && data.email !== users[index].email) {
      if (users.some(u => u.email === data.email && u.id !== id)) {
        throw new Error('El correo electrónico ya está en uso por otro usuario');
      }
    }

    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    // If we updated the currently logged in user, update the session
    const currentSession = authService.getSession();
    if (currentSession && currentSession.id === id) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
    }

    return updatedUser;
  },

  deleteUser: (id: string) => {
    let users = authService.getUsers();
    // Prevent deleting the main admin
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.email === 'rodrigoggracian@gmail.com') {
      throw new Error('No se puede eliminar al administrador principal');
    }
    
    users = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },

  resetPassword: (id: string, newPassword: string) => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].password = newPassword;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }
};