<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import { computed, markRaw } from 'vue';
import Dashboard from './views/Dashboard.vue';
import Formulario from './views/Formulario.vue';
import Relatorios from './views/Relatorios.vue';
import Eventos from './views/Eventos.vue';
import Participantes from './views/Participantes.vue';
import type { AppViews } from './types';
import { useRoute, useRouter } from 'vue-router';

const views: Record<AppViews, any> = {
  dashboard: markRaw(Dashboard),
  form: markRaw(Formulario),
  relatorio: markRaw(Relatorios),
  eventos: markRaw(Eventos),
  participantes: markRaw(Participantes)
}

const route = useRoute()
const router = useRouter()

const currentView = computed<AppViews>(() => {
  const view = route.query.view as AppViews
  return view || 'dashboard'
})

function updateView(view: AppViews) {
  router.replace({ query: { ...route.query, view } })
}

</script>

<template>
  <Sidebar :active-view="currentView" @update:active-view="updateView"/>
  <main class="flex-1">
    <component :is="views[currentView]" />
  </main>
</template>
