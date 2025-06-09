import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Loader } from 'lucide-react';

const PublicResults: React.FC = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFinalizedElections = async () => {
      try {
        const data = await apiService.getFinalizedElections();

        console.log('Finalized Elections:', data);

        setElections(data);
      } catch {
        setError('Error al cargar las elecciones finalizadas');
      } finally {
        setLoading(false);
      }
    };

    fetchFinalizedElections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white">Cargando elecciones finalizadas...</p>
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
        <h1 className="text-4xl font-bold text-white mb-2">Auditoría Pública de Elecciones</h1>
        <p className="text-purple-200">
          Consulta aquí los resultados de elecciones finalizadas.
        </p>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-white mb-2">No hay elecciones finalizadas</h2>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <Link
              key={election.idEleccion}
              to={`/auditoria/election/${election.electionIdOnChain}`}
              className="group block"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                  {election.tituloEleccion}
                </h3>
                <p className="text-sm text-purple-200 mb-2">
                  ID OnChain: {election.electionIdOnChain}
                </p>
                <p className="text-purple-300 group-hover:text-white transition-colors text-sm font-medium">
                  Ver resultados →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicResults;
