import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Lock, LogIn, Loader, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as AuthService from '../../services/AuthService';
import { walletService } from '../../services/wallet';

type LoginMethod = 'wallet-password' | 'signature';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth(); // <-- aquí añadimos user
  
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('wallet-password');
  const [formData, setFormData] = useState({
    wallet: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [connectingWallet, setConnectingWallet] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) { // <-- ahora navegación inteligente
      if (user.role === 'Voter') {
        navigate('/elections');
      } else if (user.role === 'Observer') {
        navigate('/observer');
      } else if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const connectWallet = async () => {
    setConnectingWallet(true);
    setError('');
    
    try {
      const walletAddress = await walletService.connectMetaMask();
      setFormData(prev => ({ ...prev, wallet: walletAddress }));
    } catch {
      setError('Error al conectar la wallet. Asegúrate de tener MetaMask instalado.');
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleWalletPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (!formData.wallet || !formData.contraseña) {
      setError('Wallet y contraseña son requeridos');
      setLoading(false);
      return;
    }
  
    try {
      const response = await AuthService.login({
        wallet: formData.wallet,
        contraseña: formData.contraseña,
      });
  
      login(response.token); // NO navigate aquí
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        // Si tiene errores de validación
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          const firstErrorMessage = data.errors[firstErrorKey][0];
          setError(firstErrorMessage);
        }
        // Si tiene un título general de error
        else if (data.title) {
          setError(data.title);
        } else {
          setError('Error desconocido al iniciar sesión');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignatureLogin = async () => {
    setLoading(true);
    setError('');
  
    if (!formData.wallet) {
      setError('Debe conectar su wallet primero');
      setLoading(false);
      return;
    }
  
    try {
      const nonceResponse = await AuthService.getNonce(formData.wallet);
      const nonce = nonceResponse.nonce;
  
      const signature = await walletService.signMessage(nonce, formData.wallet);

      const response = await AuthService.loginWithSignature({
        wallet: formData.wallet,
        nonce,
        signature,
      });
  
      login(response.token); 
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          const firstErrorMessage = data.errors[firstErrorKey][0];
          setError(firstErrorMessage);
        } else if (data.title) {
          setError(data.title);
        } else {
          setError('Error desconocido al iniciar sesión con firma');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión con firma');
      }
    } finally {
      setLoading(false);
    }
  };  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-purple-200 mt-2">Accede al sistema de votación</p>
          </div>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Method Selection */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('wallet-password');
                  setError('');
                }}

                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'wallet-password'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Wallet + Contraseña
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('signature');
                  setError('');
                }}
                
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'signature'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Firma de Nonce
              </button>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Dirección de Wallet
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="wallet"
                value={formData.wallet}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0x..."
                readOnly
              />
              <button
                type="button"
                onClick={connectWallet}
                disabled={connectingWallet}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {connectingWallet ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Login Forms */}
          {loginMethod === 'wallet-password' ? (
            <form onSubmit={handleWalletPasswordLogin} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  Al hacer clic en "Firmar e Iniciar Sesión", se le pedirá que firme un mensaje 
                  con su wallet para autenticarse de forma segura.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignatureLogin}
                disabled={loading || !formData.wallet}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Firmando...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5" />
                    Firmar e Iniciar Sesión
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-white hover:text-purple-200 font-medium">
                Registrarse
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
