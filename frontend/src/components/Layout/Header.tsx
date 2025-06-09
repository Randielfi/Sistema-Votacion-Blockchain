import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, User, LogOut, Shield, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAdmin, isObserver, isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();

  if (loadingAuth) {
    return null; 
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors">
            <Vote className="h-8 w-8" />
            <span className="text-xl font-bold">VoteChain</span>
          </Link>

          <Link
            to="/auditoria"
            className="text-purple-300 font-medium border-b-2 border-purple-400 hover:text-purple-200 transition-colors pb-1"
          >
            Auditoría pública
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              {user?.role === 'Voter' && (
                <Link
                  to="/elections"
                  className="flex items-center space-x-1 text-purple-300 font-medium border-b-2 border-purple-400 hover:text-purple-200 transition-colors pb-1"
                >
                  <Vote className="h-4 w-4" />
                  <span>Elecciones</span>
                </Link>
              )}
              {user?.role === 'Admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-purple-300 font-medium border-b-2 border-purple-400 hover:text-purple-200 transition-colors pb-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Panel Admin</span>
                </Link>
              )}
              {user?.role === 'Observer' && (
                <Link
                  to="/observer"
                  className="flex items-center space-x-1 text-purple-300 font-medium border-b-2 border-purple-400 hover:text-purple-200 transition-colors pb-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Panel Observador</span>
                </Link>
              )}
            </nav>          
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user?.nombre}</span>
                  
                  {user?.role === 'Admin' && (
                    <Shield className="h-4 w-4 text-yellow-400" title="Administrador" />
                  )}
                  {user?.role === 'Observer' && (
                    <Eye className="h-4 w-4 text-blue-400" title="Observador" />
                  )}
                  {user?.role === 'Voter' && (
                    <Vote className="h-4 w-4 text-green-400" title="Votante" />
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-white hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
