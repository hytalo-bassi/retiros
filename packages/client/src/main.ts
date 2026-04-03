import { createApp } from 'vue'
import './style.css'
import { consola } from "consola"
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

if (import.meta.env.PROD) {
  consola.info('Modo de produção ativado. Diminuindo logs de depuração.');
  consola.level = 1; // Apenas logs de erro
} else {
  consola.info('Modo de desenvolvimento ativado. Logs de depuração completos.');
  consola.level = 4; // Todos os logs
}

const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: App }]
})

app.use(router);
app.mount("#app");