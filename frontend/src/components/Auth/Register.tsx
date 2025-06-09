import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wallet, Lock, UserPlus, Loader } from 'lucide-react';
import * as AuthService from '../../services/AuthService';
import { walletService } from '../../services/wallet';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numeroCedula: '',
    wallet: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectingWallet, setConnectingWallet] = useState(false);

  const validateCedula = (cedula: string): boolean => {
    const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
    return cedulaRegex.test(cedula);
  };

  const handleCedulaFormat = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`;
    } else if (digits.length <= 11) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 10)}-${digits.substring(10)}`;
    } else {
      return `${digits.substring(0, 3)}-${digits.substring(3, 10)}-${digits.substring(10, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'numeroCedula') {
      const formatted = handleCedulaFormat(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const connectWallet = async () => {
    setConnectingWallet(true);
    setError('');
    
    try {
      const walletAddress = await walletService.connectMetaMask();
      setFormData(prev => ({ ...prev, wallet: walletAddress }));
    } catch{
      setError('Error al conectar la wallet. Asegúrate de tener MetaMask instalado.');
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      setError('Nombres y apellidos son requeridos');
      setLoading(false);
      return;
    }

    if (!validateCedula(formData.numeroCedula)) {
      setError('Formato de cédula inválido. Use el formato: 000-0000000-0');
      setLoading(false);
      return;
    }

    if (!formData.wallet) {
      setError('Debe conectar su wallet');
      setLoading(false);
      return;
    }

    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(formData);
      navigate('/login', { 
        state: { message: 'Registro exitoso. Ahora puede iniciar sesión.' }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
            <p className="text-purple-200 mt-2">Únete al sistema de votación blockchain</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nombres
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Juan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Apellidos
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Cédula Dominicana
              </label>
              <input
                type="text"
                name="numeroCedula"
                value={formData.numeroCedula}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="000-0000000-0"
                required
              />
            </div>

            <div>
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
                  placeholder="Mínimo 6 caracteres"
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
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-white hover:text-purple-200 font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;