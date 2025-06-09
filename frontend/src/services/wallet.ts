import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletService {
  async connectMetaMask(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length === 0) {
        throw new Error('No se pudo conectar con MetaMask');
      }
      
      return accounts[0];
    } catch (error) {
      throw new Error('Error al conectar con MetaMask');
    }
  }

  async signMessage(message: string, wallet: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      

      // Verificar que la wallet conectada es la misma
      const address = await signer.getAddress();
      if (address.toLowerCase() !== wallet.toLowerCase()) {
        throw new Error('La wallet conectada no coincide');
      }
      
      return await signer.signMessage(message);
    } catch (error: any) {
      console.error('Error en signMessage:', error);
      throw new Error('Error al firmar el mensaje');
    }
  }

  async isWalletConnected(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      return null;
    }
  }
}

export const walletService = new WalletService();