import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader, ArrowLeft } from 'lucide-react';

const PublicElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [winner, setWinner] = useState<any>(null);
  const [integrityHash, setIntegrityHash] = useState<string>('');
  const [signatures, setSignatures] = useState<any[]>([]);
  const [showSignatures, setShowSignatures] = useState(false);
  const [loadingSignatures, setLoadingSignatures] = useState(false);

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const cleanId = String(id).trim();
        console.log("Llamando a /api/Election/", cleanId, "/results");

        const statusResponse = await fetch(`/api/Election/${cleanId}/status`);
        if (!statusResponse.ok) {
          if (statusResponse.status === 404) {
            throw new Error('Esta elección no existe o no tiene estado en la blockchain');
          }
          throw new Error('Error al obtener detalles de la elección');
        }

        const statusData = await statusResponse.json();
        setElection(statusData);

        const resultsResponse = await fetch(`/api/Election/${cleanId}/results-with-integrity`);
        if (!resultsResponse.ok) {
          if (resultsResponse.status === 404) {
            throw new Error('Esta elección no tiene resultados en la blockchain');
          }
          throw new Error('Error al obtener resultados');
        }

        const resultsData = await resultsResponse.json();

        setResults(resultsData.results);
        setIntegrityHash(resultsData.integrityHash);
        
        const winnerResponse = await fetch(`/api/Election/${cleanId}/winner`);
        if (!winnerResponse.ok) {
            if (winnerResponse.status === 404) {
            throw new Error('No se pudo obtener el ganador de esta elección');
            }
        throw new Error('Error al obtener el ganador');
        }

        const winnerData = await winnerResponse.json();
        setWinner(winnerData);
      } catch (error) {
        console.error('Error en PublicElectionDetail:', error);
        if (error instanceof Error) {
          setError(error.message || 'Error al cargar detalles de la elección');
        } else {
          setError('Error al cargar detalles de la elección');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchElectionDetails();
  }, [id]);

  const fetchSignatures = async () => {
    if (!id) return;
    setLoadingSignatures(true);
    try {
      const response = await fetch(`/api/Election/${id}/signatures`);
      const data = await response.json();
      setSignatures(data);
      setShowSignatures(true);
    } catch (error) {
      console.error('Error loading signatures:', error);
    } finally {
      setLoadingSignatures(false);
    }
  };    

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white">Cargando detalles de la elección...</p>
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
        <Link to="/auditoria" className="inline-flex items-center text-purple-300 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a auditoría
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">{election?.title || 'Elección'}</h1>
        <p className="text-purple-200 mb-4">
          Estado: {election?.ended ? 'Finalizada' : 'Activa / No finalizada'}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4"> Ganador de la Elección</h2>
        
        {winner ? (
            winner.isTie ? (
            <div className="bg-purple-600/20 backdrop-blur-md border border-purple-400/50 text-purple-100 px-6 py-4 rounded-xl text-center text-xl font-medium">
                🤝 Hay un <span className="font-bold">empate</span> en esta elección.
            </div>
            ) : (
            <div className="bg-green-600/20 backdrop-blur-md border border-green-400/50 text-green-100 px-6 py-4 rounded-xl text-center text-2xl font-bold">
                🏆 {winner.winner} con {winner.votes} voto{winner.votes !== 1 ? 's' : ''}
            </div>
            )
        ) : (
            <p className="text-purple-200">No disponible.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Resultados:</h2>
        {results.length === 0 ? (
          <p className="text-purple-200">No hay votos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">Candidato</th>
                  <th className="px-6 py-3 text-left">Votos</th>
                </tr>
              </thead>
              <tbody>
                {results.map((candidate: any, index: number) => (
                  <tr key={index} className="border-t border-white/20">
                    <td className="px-6 py-4">{candidate.candidateName}</td>
                    <td className="px-6 py-4">{candidate.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-purple-300 mt-4 text-sm">
                Hash de integridad: <code className="break-all">{integrityHash}</code>
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Firmas de la elección:</h2>

        {!showSignatures ? (
          <button
            onClick={fetchSignatures}
            disabled={loadingSignatures}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loadingSignatures ? 'Cargando firmas...' : 'Ver firmas de la elección'}
          </button>
        ) : (
          <button
            onClick={() => setShowSignatures(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors mb-4"
          >
            Ocultar firmas
          </button>
        )}

        {showSignatures && (
          <div className="mt-4">
            {signatures.length === 0 ? (
              <p className="text-purple-200">No hay firmas registradas.</p>
            ) : (
              <ul className="list-disc pl-6 text-purple-200 space-y-2">
                {signatures.map((sig: any, index: number) => (
                  <li key={index}>
                    {sig.observerName} ({sig.observerPublicKey}) - Hash: {sig.integrityHash}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicElectionDetail;
