import { ethers } from 'ethers';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getElectionAbi = async () => {
  const response = await fetch('/src/contracts/Election.json');
  const abi = await response.json();
  return abi;
};

export const getElectionContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask no está disponible');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const abi = await getElectionAbi();

  const contract = new ethers.Contract(
    contractAddress,
    abi,
    signer
  );

  return contract;
};
