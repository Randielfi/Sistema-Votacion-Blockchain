export interface Voter {
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  wallet: string;
  contraseña: string;
  role?: 'Admin' | 'Voter'| 'Observer';
}

export interface Election {
  id: string;
  titulo: string;
  idOnChain: string;
  estado: 'Activo' | 'Finalizada';
  candidatos: Candidate[];
}

export interface Candidate {
  id: string;
  nombre: string;
  partido?: string;
  votos?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isObserver: boolean;
  loadingAuth: boolean;
  isAuthenticated: boolean;
}

export interface User {
  wallet: string;
  nombre: string;
  role: 'Admin' | 'Voter'| 'Observer';
}

export interface LoginCredentials {
  wallet: string;
  contraseña: string;
}

export interface NonceResponse {
  nonce: string;
}

export interface AuthResponse {
  token: string;
}

export interface CandidateResult {
  candidateName: string;
  votes: number;
}