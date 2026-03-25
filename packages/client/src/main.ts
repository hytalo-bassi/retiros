import { createApp } from 'vue'
import './style.css'
import { consola } from "consola"
import App from './App.vue'
import clienteApi from './api/cliente'

async function apiHealthcheck(): Promise<string> {
  const response = await clienteApi.get(`/health/healthcheck`);
  return response.data;
}

if (import.meta.env.PROD) {
  consola.info('Modo de produção ativado. Diminuindo logs de depuração.');
  consola.level = 1; // Apenas logs de erro
} else {
  consola.info('Modo de desenvolvimento ativado. Logs de depuração completos.');
  consola.level = 4; // Todos os logs
}

createApp(App).mount('#app');
(async () => {
  const health = await apiHealthcheck();
  console.log(health);
})();