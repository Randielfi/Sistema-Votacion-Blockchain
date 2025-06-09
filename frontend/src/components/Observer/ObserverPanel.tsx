import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ObserverPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [integrityHash, setIntegrityHash] = useState<string>('');
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [winner, setWinner] = useState<any>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await apiService.getFinalizedElections();
        setElections(data);
      } catch (error) {
        console.error('Error loading elections', error);
      }
    };

    fetchElections();
  }, []);

  const handleSelectElection = async (election: any) => {
    // Si ya está seleccionada esta misma, cerrar
    if (selectedElection && selectedElection.idEleccion === election.idEleccion) {
      setSelectedElection(null);
      return;
    }
  
    // Si es otra, abrirla
    setSelectedElection(election);
    setLoading(true);
    setMessage('');
  
    try {
      // Get results + hash
      const resultsResponse = await fetch(`/api/Election/${election.electionIdOnChain}/results-with-integrity`);
      const resultsData = await resultsResponse.json();
      setResults(resultsData.results);
      setIntegrityHash(resultsData.integrityHash);
  
      // Get signatures
      const signaturesResponse = await fetch(`/api/Election/${election.electionIdOnChain}/signatures`);
      const signaturesData = await signaturesResponse.json();
      setSignatures(signaturesData);

      const winnerResponse = await fetch(`/api/Election/${election.electionIdOnChain}/winner`);
      const winnerData = await winnerResponse.json();
      setWinner(winnerData);

  
    } catch (error) {
      console.error('Error loading election details', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignWithMetamask = async () => {
    try {
      if (!window.ethereum) {
        setMessage('Metamask no está disponible.');
        return;
      }
  
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
  
      // Validar que la wallet usada es la que está en el AuthContext
      if (currentAccount.toLowerCase() !== user?.wallet.toLowerCase()) {
        setMessage(`❌ La wallet conectada en MetaMask es **${currentAccount}**, pero tu cuenta actual es **${user?.wallet}**.
        
  Por favor selecciona la cuenta correcta en MetaMask antes de firmar.`);
        return;
      }
  
      // Construir el mensaje que vamos a firmar
      const messageToSign = `Hash de integridad: ${integrityHash}`;
  
      // Pedir a Metamask que firme el mensaje
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, currentAccount],
      });
  
      // Enviar firma al backend (notar que enviamos el hash puro en 'integrityHash')
      const response = await fetch(`/api/Election/${selectedElection.electionIdOnChain}/sign-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrityHash, // SOLO el hash puro
          observerName: user?.nombre,
          observerPublicKey: currentAccount,
          observerSignature: signature,
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al firmar el resultado');
      }
  
      setMessage('✅ Firma registrada correctamente con Metamask.');
  
      // Reload signatures
      const signaturesResponse = await fetch(`/api/Election/${selectedElection.electionIdOnChain}/signatures`);
      const signaturesData = await signaturesResponse.json();
      setSignatures(signaturesData);
  
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };
  

  const hasSigned = signatures.some(sig => sig.observerPublicKey === user?.wallet && sig.integrityHash === integrityHash);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Panel de Observador</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Elecciones Finalizadas</h2>
        <div className="flex flex-wrap gap-4">
          {elections.map((election) => (
            <button
              key={election.idEleccion}
              onClick={() => handleSelectElection(election)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {election.tituloEleccion}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Cargando detalles de la elección...</p>
        </div>
      )}

      {selectedElection && !loading && (
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-white mb-4">Detalles de la Elección: {selectedElection.tituloEleccion}</h2>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2"> Ganador de la Elección</h2>
            {winner ? (
                winner.isTie ? (
                <div className="bg-purple-600/20 backdrop-blur-md border border-purple-400/50 text-purple-100 px-6 py-4 rounded-xl text-center text-2xl font-medium">
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

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">Resultados:</h3>
            <table className="min-w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white mb-4">
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
            <p className="text-purple-300 text-sm">
              Hash de integridad: <code className="break-all">{integrityHash}</code>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Firmas registradas:</h3>
            {signatures.length === 0 ? (
              <p className="text-purple-200">No hay firmas registradas.</p>
            ) : (
              <ul className="list-disc pl-6 text-purple-200">
                {signatures.map((sig: any, index: number) => (
                  <li key={index}>
                    {sig.observerName} ({sig.observerPublicKey}) - Hash: {sig.integrityHash}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hasSigned && (
            <div className="text-green-400 font-semibold">
              ✅ Ya has firmado este resultado.
            </div>
          )}

          {message && (
            <div className={`mt-4 px-4 py-3 rounded-lg ${
              message.includes('correctamente') ? 'bg-green-500/20 text-green-200 border border-green-500/50' :
              'bg-red-500/20 text-red-200 border border-red-500/50'
            }`}>
              {message}
            </div>
          )}

          {!hasSigned && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Firmar resultado con Metamask:</h3>
              <button
                onClick={handleSignWithMetamask}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Firmar con Metamask
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObserverPanel;
