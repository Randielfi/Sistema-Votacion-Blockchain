import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, Vote, Loader, CheckCircle, X, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Candidate } from '../../types';

const AdminPanel: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ nombres: '', apellidos: '' });
  const [elections, setElections] = useState<any[]>([]);
  const [winner, setWinner] = useState<{ winner: string; votes: number; isTie: boolean; 
    message: string } | null>(null);
  const [confirmElectionId, setConfirmElectionId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    candidatos: [] as string[],
  });

  const fetchCandidates = async () => {
    try {
      if (!token) throw new Error('Token no encontrado');
      const data = await apiService.getCandidates(token);
      const mappedCandidates = data.map((c: any) => ({
        id: c.idCandidato.toString(),
        nombre: `${c.nombres} ${c.apellidos}`,
        partido: ''
      }));
      setAvailableCandidates(mappedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  const fetchElections = async () => {
    try {
      if (!token) throw new Error('Token no encontrado');
      const data = await apiService.getElections(token);
      setElections(data);
    } catch (error) {
      console.error('Error al obtener elecciones:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCandidates();
      fetchElections();
    }
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Acceso Denegado</h2>
        <p className="text-purple-200">No tienes permisos para acceder al panel de administración.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCandidateToggle = (candidateId: string) => {
    setFormData(prev => ({
      ...prev,
      candidatos: prev.candidatos.includes(candidateId)
        ? prev.candidatos.filter(id => id !== candidateId)
        : [...prev.candidatos, candidateId]
    }));
  };

  const handleCandidateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCandidateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!candidateForm.nombres.trim() || !candidateForm.apellidos.trim()) {
      setError('Nombre y Apellido son requeridos');
      setLoading(false);
      return;
    }

    try {
      if (!token) throw new Error('Token no encontrado');
      await apiService.createCandidate(candidateForm, token);

      setSuccess('Candidato creado correctamente');
      setCandidateForm({ nombres: '', apellidos: '' });
      setShowCandidateForm(false);
      fetchCandidates();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear el candidato');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      setLoading(false);
      return;
    }

    if (formData.candidatos.length < 2) {
      setError('Debe seleccionar al menos 2 candidatos');
      setLoading(false);
      return;
    }

    try {
      if (!token) throw new Error('Token no encontrado');
      await apiService.startElection({
        titulo: formData.titulo,
        candidatos: formData.candidatos,
      }, token);

      setSuccess('Elección creada exitosamente');
      setFormData({ titulo: '', candidatos: [] });
      setShowCreateForm(false);
      fetchElections();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la elección');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeElection = async (electionId: number) => {
    if (!token) return;
  
    try {
      await apiService.endElection(electionId, token);
  
      // Esperar un poquito para que la blockchain actualice
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      // Obtener el ganador desde el backend
      const winnerData = await apiService.getElectionWinner(electionId, token);
      setWinner(winnerData);
  
      // Opcional: refrescar la lista de elecciones
      await fetchElections();
  
    } catch (error) {
      console.error('Error al finalizar elección:', error);
    }
  };
  
  

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Panel de Administración</h1>
        </div>
        <p className="text-purple-200">Gestiona las elecciones del sistema blockchain</p>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Candidatos</h3>
                <p className="text-purple-200 text-sm">Disponibles</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{availableCandidates.length}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Elecciones</h3>
                <p className="text-purple-200 text-sm">Sistema activo</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{elections.length}</div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nueva Elección
            </button>
            <button
              onClick={() => setWinner(null)}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center mx-auto"
            >
              Cerrar
            </button>

            <button
              onClick={() => setShowCandidateForm(!showCandidateForm)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nuevo Candidato
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-6">
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título de la elección"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />

              <div className="space-y-2">
                {availableCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    onClick={() => handleCandidateToggle(candidate.id)}
                    className={`cursor-pointer p-3 rounded-lg border ${formData.candidatos.includes(candidate.id)
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/20 text-purple-200'}`}
                  >
                    {candidate.nombre}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? 'Creando...' : 'Crear Elección'}
              </button>
            </form>
          )}

          {showCandidateForm && (
            <form onSubmit={handleCreateCandidate} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-6">
              <input
                type="text"
                name="nombres"
                value={candidateForm.nombres}
                onChange={handleCandidateInputChange}
                placeholder="Nombres"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <input
                type="text"
                name="apellidos"
                value={candidateForm.apellidos}
                onChange={handleCandidateInputChange}
                placeholder="Apellidos"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? 'Creando...' : 'Crear Candidato'}
              </button>
            </form>
          )}

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Elecciones</h2>
            {elections.map(election => (
              <div
                key={election.idEleccion}
                className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/20"
              >
                <div>
                  <h4 className="text-lg font-semibold text-white">{election.tituloEleccion}</h4>
                  <p className="text-purple-200 text-sm">ID OnChain: {election.electionIdOnChain}</p>
                  <p className="text-purple-200 text-sm mt-1">Estado: {election.estado}</p>
                </div>

                {election.estado === 'Activo' && (
                  <button
                    onClick={() => setConfirmElectionId(election.electionIdOnChain)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Finalizar
                  </button>
                )}

                {confirmElectionId !== null && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white text-center rounded-xl p-8 max-w-md shadow-lg">
                      <h2 className="text-2xl font-bold mb-4">Confirmar Finalización</h2>
                      <p className="text-gray-700 mb-6">
                        ¿Estás seguro de que deseas finalizar esta elección? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={async () => {
                            if (!token) return;
                            try {
                              await apiService.endElection(confirmElectionId!, token);
                              await new Promise(resolve => setTimeout(resolve, 1500));
                              const winnerData = await apiService.getElectionWinner(confirmElectionId!, token);
                              setWinner(winnerData);
                              await fetchElections();
                            } catch (error) {
                              console.error('Error al finalizar elección:', error);
                            } finally {
                              setConfirmElectionId(null);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                        >
                          Sí, Finalizar
                        </button>
                        <button
                          onClick={() => setConfirmElectionId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {winner && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
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
                        onClick={() => setWinner(null)}
                        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
