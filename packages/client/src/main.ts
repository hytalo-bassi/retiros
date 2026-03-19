import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import clienteApi from './api/cliente'

async function apiHealthcheck(): Promise<string> {
  const response = await clienteApi.get(`/health/healthcheck`);
  return response.data;
}


createApp(App).mount('#app');
(async () => {
  const health = await apiHealthcheck();
  console.log(health);
})();