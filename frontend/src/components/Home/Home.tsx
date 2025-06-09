import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Shield, Users, Zap, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <Vote className="h-8 w-8" />,
      title: "Votación Segura",
      description: "Sistema de votación basado en blockchain para máxima transparencia y seguridad"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Autenticación Dual",
      description: "Inicia sesión con wallet + contraseña o mediante firma de nonce criptográfico"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Resultados en Tiempo Real",
      description: "Consulta los resultados de las elecciones en vivo mientras transcurre la votación"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Inmutable & Verificable",
      description: "Todos los votos quedan registrados permanentemente en la blockchain"
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Vota el 
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Futuro</span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Sistema de votación descentralizado construido en blockchain. 
            Transparente, seguro e inmutable.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Crear Cuenta
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium py-4 px-8 rounded-xl border border-white/20 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <Vote className="h-5 w-5" />
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/elections"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Vote className="h-5 w-5" />
              Ver Elecciones
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Shield className="h-5 w-5" />
                Panel Admin
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
              {feature.title}
            </h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Process Steps */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          ¿Cómo Funciona?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Conecta tu Wallet</h3>
            <p className="text-purple-200">
              Usa MetaMask para conectar tu wallet y autenticarte de forma segura
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Participa en Elecciones</h3>
            <p className="text-purple-200">
              Explora las elecciones activas y emite tu voto por tu candidato preferido
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Resultados Verificables</h3>
            <p className="text-purple-200">
              Consulta resultados en tiempo real con total transparencia blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-white">100%</div>
            <div className="text-purple-200">Transparente</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-md rounded-2xl p-8 border border-blue-500/30">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-white flex items-center justify-center gap-2">
              <Zap className="h-10 w-10" />
            </div>
            <div className="text-blue-200">Tiempo Real</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md rounded-2xl p-8 border border-green-500/30">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-white flex items-center justify-center gap-2">
              <Lock className="h-10 w-10" />
            </div>
            <div className="text-green-200">Inmutable</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {!isAuthenticated && (
        <div className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para participar?
          </h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Únete a la revolución democrática digital. Crea tu cuenta y participa en elecciones transparentes y seguras.
          </p>
          <Link
            to="/register"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
          >
            <Users className="h-6 w-6" />
            Comenzar Ahora
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;