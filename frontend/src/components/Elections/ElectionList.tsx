import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Vote, Clock, CheckCircle, Users, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Election } from '../../types';

const ElectionList: React.FC = () => {
  const { token } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      if (!token) return;
      
      try {
        const data = await apiService.getElections(token);

        console.log('Elections:', data);

        // Mapeamos la estructura que devuelve la API a lo que espera ElectionList
        const mappedElections = data.map((e: any) => ({
          id: e.idEleccion,
          titulo: e.tituloEleccion,
          idOnChain: e.electionIdOnChain,
          estado: e.estado,
          candidatos: e.candidatos
        }));

        setElections(mappedElections);
      } catch {
        setError('Error al cargar las elecciones');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Cargando elecciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Elecciones Disponibles</h1>
        <p className="text-purple-200">
          Participa en las elecciones activas o consulta los resultados de las finalizadas
        </p>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No hay elecciones disponibles</h2>
          <p className="text-purple-200">Las elecciones aparecerán aquí cuando estén disponibles.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <Link
              key={election.id}
              to={`/election/${election.id}`}
              className="group block"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                      {election.titulo}
                    </h3>
                    <p className="text-sm text-purple-200 mb-2">
                      ID OnChain: {election.idOnChain}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                    election.estado === 'Activo' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}>
                    {election.estado === 'Activo' ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    <span>{election.estado}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-200">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {election.candidatos?.length || 0} candidatos
                    </span>
                  </div>
                  
                  <div className="text-purple-300 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">
                      {election.estado === 'Activo' ? 'Votar →' : 'Ver resultados →'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionList;
