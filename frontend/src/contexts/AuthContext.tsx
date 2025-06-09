import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JWTPayload {
  nameid: string;            
  unique_name: string;       
  role: 'Admin' | 'Voter'| 'Observer';
  exp: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            wallet: decoded.nameid,
            nombre: decoded.unique_name,
            role: decoded.role,
          });
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setLoadingAuth(false);
  }, []);


  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(newToken);
      setToken(newToken);
      setUser({
        wallet: decoded.nameid,             
        nombre: decoded.unique_name,
        role: decoded.role,
      });
      localStorage.setItem('authToken', newToken);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAdmin: user?.role === 'Admin',
    isObserver: user?.role === 'Observer',
    isAuthenticated: !!user && !!token,
    loadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
