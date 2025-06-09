import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, Clock, CheckCircle, Loader, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getElectionContract } from '../../services/blockchainService';
import { CandidateResult } from '../../types';

const ElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [election, setElection] = useState<any | null>(null);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [success, setSuccess] = useState('');
  const [winner, setWinner] = useState<{ winner: string; 
    votes: number; isTie: boolean; 
    message: string } | null>(null);


  useEffect(() => {
    const fetchElectionData = async () => {
      if (!token || !id) return;
      try {
        const electionData = await apiService.getElection(id, token);
        setElection({
          id: electionData.idEleccion,
          titulo: electionData.tituloEleccion,
          idOnChain: electionData.electionIdOnChain,
          estado: electionData.estado,
          candidatos: electionData.candidatos
        });

        const resultsData = await apiService.getElectionResults(id, token);
        setResults(resultsData.results);  // esto NO lo haces en 'Activo'
  
        // Si la elección está activa o finalizada, cargar resultados
        if (electionData.estado === 'Finalizada') {
          const winnerData = await apiService.getElectionWinner(parseInt(id), token);
          setWinner(winnerData);
        }
        
  
        if (user?.wallet) {
          const hasVotedResponse = await apiService.hasVoted(user.wallet, electionData.electionIdOnChain);
          console.log('Estado de hasVoted:', hasVotedResponse);
  
          setHasVoted(Boolean(hasVotedResponse.hasVoted));
        }
      } catch {
        setError('Error al cargar los datos de la elección');
      } finally {
        setLoading(false);
      }
    };
  
    fetchElectionData();
  }, [token, id, user]);

    // 🚀 Polling para actualizar resultados en tiempo real cada 5 segundos
  useEffect(() => {
    if (election?.estado === 'Activo') {
      console.log('Iniciando polling de resultados en tiempo real...');
      const interval = setInterval(async () => {
        try {
          const resultsData = await apiService.getElectionResults(id, token);
          setResults(resultsData.results);
          console.log('Resultados actualizados automáticamente');
        } catch (err) {
          console.error('Error actualizando resultados:', err);
        }
      }, 5000); // cada 5 segundos

      return () => {
        console.log('Deteniendo polling de resultados');
        clearInterval(interval);
      };
    }
  }, [election?.estado, id, token]);

  const handleVote = async (candidateId: number, candidateIndex: number) => {
    if (!token || !id || voting || hasVoted) return;
  
    setVoting(true);
    setError('');
    setSuccess('');
  
    try {
      const contract = await getElectionContract();
  
      const tx = await contract.vote(
        election.idOnChain,
        candidateIndex
      );
  
      await tx.wait();
  
      // Reload resultados
      const resultsData = await apiService.getElectionResults(id, token);
      setResults(resultsData.results);
  
      // Reload hasVoted (después de que el voto se registre)
      if (user?.wallet) {
        const hasVotedResponse = await apiService.hasVoted(user.wallet, election.idOnChain);
        setHasVoted(Boolean(hasVotedResponse.hasVoted));
      }
  
      setSuccess('Tu voto ha sido registrado correctamente.');
    } catch (error: any) {
      console.error(error);
  
      if (error?.message?.includes('user rejected')) {
        setError('Has cancelado la firma del voto.');
      } else {
        setError(error instanceof Error ? error.message : 'Error al votar');
      }
    } finally {
      setVoting(false);
    }
  };
  
  
  const totalVotes = results.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
  const sortedResults = [...results].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  console.log('Render ElectionDetail: hasVoted=', hasVoted, 'typeof', typeof hasVoted);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Cargando elección...</p>
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

  if (!election) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-white mb-2">Elección no encontrada</h2>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/elections')}
        className="flex items-center space-x-2 text-purple-200 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Volver a elecciones</span>
      </button>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{election.titulo}</h1>
            <p className="text-purple-200 mb-4">ID OnChain: {election.idOnChain}</p>
          </div>

          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
            election.estado === 'Activo' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
          }`}>
            {election.estado === 'Activo' ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{election.estado}</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      

      {election.estado === 'Activo' && !hasVoted ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Candidatos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {election.candidatos.map((candidate: any) => (
              <div
                key={candidate.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{candidate.nombre}</h3>

                <button
                  onClick={() => handleVote(candidate.id, candidate.candidateIndex)}
                  disabled={voting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {voting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Votando...
                    </>
                  ) : (
                    <>
                      <Vote className="h-5 w-5" />
                      Votar
                    </>
                  )}
                </button>
              </div>
              ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="h-7 w-7" />
            {election.estado === 'Finalizada' ? 'Resultados Finales' : 'Resultados en Tiempo Real'}
          </h2>

          <div className="space-y-4">
            {sortedResults.map((candidate, index) => {
              const votes = candidate.votes || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

              return (
                <div
                  key={candidate.candidateName}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{candidate.candidateName}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{votes}</div>
                      <div className="text-sm text-purple-200">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {election.estado === 'Finalizada' && winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          <div className="bg-white text-center rounded-xl p-8 max-w-md shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Resultado Final</h2>
            {winner.isTie ? (
              <p className="text-lg text-red-600 font-semibold">Empate entre candidatos</p>
            ) : (
              <div className="text-center text-green-600 font-semibold text-lg space-y-2">
                <div>
                  <span className="text-xl">🏆 Ganador:</span> {winner.winner}
                </div>
                <div>
                  <span className="text-xl">🗳️ Votos:</span> {winner.votes}
                </div>
              </div>
            )}
            <button
              onClick={() => setWinner(null)}  // para cerrar el modal
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionDetail;
