import axios from 'axios';
import type { RelationSchema, ValidationResponse, MasteryConcept } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCsrfCookie = async (): Promise<void> => {
  await axios.get('/sanctum/csrf-cookie', {
    baseURL: 'http://localhost:8000',
    withCredentials: true,
  });
};

export const validateSchema = async (schema: RelationSchema): Promise<ValidationResponse> => {
  const response = await axiosInstance.post('/validate-schema', schema);
  return response.data;
};

export const getUserMastery = async (userId: number): Promise<MasteryConcept[]> => {
  const response = await axiosInstance.get(`/analytics/mastery/${userId}`);
  return response.data;
};

export default axiosInstance;
