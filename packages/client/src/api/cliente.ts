import axios, { type AxiosInstance } from "axios";
import { consola } from "consola";

const logger = consola.withTag("api");

const clienteApi: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  timeout: 5000,
});

clienteApi.interceptors.request.use((config) => {
  logger.info({
    message: "Requisição",
    method: config.method?.toUpperCase(),
    url: config.url,
  });
  return config;
});

clienteApi.interceptors.response.use(
  (response) => {
    logger.success({
      message: "Resposta",
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    logger.error({
      message: "Requisição falhou",
      status: error.response?.status,
      url: error.config?.url,
      cause: error.message,
    });
    return Promise.reject(error);
  }
);

export default clienteApi;