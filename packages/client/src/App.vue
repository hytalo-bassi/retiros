<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import { markRaw, ref } from 'vue';
import Dashboard from './views/Dashboard.vue';
import Formulario from './views/Formulario.vue';
import Relatorios from './views/Relatorios.vue';
import Eventos from './views/Eventos.vue';
import Participantes from './views/Participantes.vue';
import type { AppViews } from './types';

const views: Record<AppViews, any> = {
  dashboard: markRaw(Dashboard),
  form: markRaw(Formulario),
  relatorio: markRaw(Relatorios),
  eventos: markRaw(Eventos),
  participantes: markRaw(Participantes)
}

const currentView = ref<AppViews>('dashboard')

</script>

<template>
  <Sidebar :active-view="currentView" @update:active-view="currentView = $event"/>
  <main class="flex-1">
    <component :is="views[currentView]" />
  </main>
</template>
