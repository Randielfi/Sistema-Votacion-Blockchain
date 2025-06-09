const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7151';

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async register(data: {
    numeroCedula: string;
    nombres: string;
    apellidos: string;
    wallet: string;
    contraseña: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    
    return response.json();
  }

  async login(data: { wallet: string; contraseña: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }
    
    return response.json();
  }

  async getNonce(wallet: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/nonce?wallet=${wallet}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get nonce');
    }
    
    return response.json();
  }

  async loginWithSignature(data: {
    wallet: string;
    nonce: string;
    signature: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login-with-signature`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Signature login failed');
    }
    
    return response.json();
  }

  async getElections(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/election`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch elections');
    }
    
    return response.json();
  }

  async getElection(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/election/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch election');
    }
    
    return response.json();
  }

  async getElectionResults(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/election/${id}/results-with-integrity`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }
    
    return response.json();
  }

  async startElection(data: { titulo: string; candidatos: string[] }, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/election/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        Title: data.titulo,
        CandidateIds: data.candidatos.map(id => parseInt(id)) // importante: enviar como números
      }),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to start election');
    }
  
    return response.json();
  }
  
  async submitVote(data: { electionId: string | 
    number; candidateId: string | 
    number; wallet: string }, 
    token: string) {
    const response = await fetch(`${API_BASE_URL}/api/vote/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to submit vote');
    }
    
    return response.json();
  }

  async hasVoted(wallet: string, electionId: number | string) {
    const response = await fetch(`${API_BASE_URL}/api/vote/has-voted?wallet=${wallet}&electionId=${electionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to check vote status');
    }

    return response.json(); 
}

async getCandidates(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/candidate`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
  });

  if (!response.ok) {
      throw new Error('Error al obtener los candidatos');
  }

  return response.json();
}

async createCandidate(data: { nombres: string; apellidos: string }, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/candidate`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data)
  });

  if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al crear el candidato');
  }

  return response.json();
}

async endElection(id: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/election/${id}/end`, {
    method: 'POST',
    headers: this.getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al finalizar elección');
  }

  return response.json();
}

async getElectionWinner(electionId: number, token: string): Promise<{ winner: string; votes: number; isTie: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/election/${electionId}/winner`, {
    method: 'GET',
    headers: this.getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Error al obtener el ganador de la elección');
  }

  return await response.json();
}

async getFinalizedElections() {
  const response = await fetch(`${API_BASE_URL}/api/election/finalizadas`, {
    method: 'GET',
    headers: this.getAuthHeaders() // aunque no requiere auth, está bien enviar el header
  });

  if (!response.ok) {
    throw new Error('Error al obtener elecciones finalizadas');
  }

  return response.json();
}
}

export const apiService = new ApiService();
