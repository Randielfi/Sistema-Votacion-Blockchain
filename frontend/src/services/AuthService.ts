// src/services/AuthService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// LOGIN
export const login = (credentials: { wallet: string; contraseña: string; }) => {
  return axios
    .post(`${API_URL}/api/auth/login`, credentials)
    .then(res => res.data);
};

// REGISTER
export const register = (data: { numeroCedula: string; nombres: string; apellidos: string; wallet: string; contraseña: string; }) => {
  return axios
    .post(`${API_URL}/api/auth/register`, data)
    .then(res => res.data);
};

// GET NONCE
export const getNonce = (wallet: string) => {
  return axios
    .get(`${API_URL}/api/auth/nonce?wallet=${wallet}`)
    .then(res => res.data);
};

// LOGIN WITH SIGNATURE
export const loginWithSignature = (data: { wallet: string; nonce: string; signature: string; }) => {
  return axios
    .post(`${API_URL}/api/auth/login-with-signature`, data)
    .then(res => res.data);
};
