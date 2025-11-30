
export interface ProcessedFile {
  id: string;
  originalName: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface RowData {
  [key: string]: any;
  "Descripcion"?: string;
  "Código de Barras Para Venta"?: string | number;
  "C/P"?: string;
  "Precio Regular Derma"?: string | number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingError {
  fileName: string;
  message: string;
}

export interface ProcessResult {
  successCount: number;
  failures: ProcessingError[];
}

// --- Auth Types ---

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // In a real app, this would be a hash
  avatar?: string;
  birthdate?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}