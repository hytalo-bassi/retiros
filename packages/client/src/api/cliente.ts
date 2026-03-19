import axios, { type AxiosInstance, type AxiosResponse } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  timeout: 5000,
});

const clienteApi = apiClient;

clienteApi.interceptors.request.use((config) => {
  console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Error]", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default clienteApi;