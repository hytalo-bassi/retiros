<script setup lang="ts">
import type { AppViews } from '../types';
import SidebarNavItem from './SidebarNavItem.vue';

interface Props {
  activeView: AppViews
}
defineProps<Props>()
const emit = defineEmits(['update:activeView']);
const appName = import.meta.env.VITE_APP_TITLE ?? "Eventos"

const handleClick = (view: AppViews) => {
  emit('update:activeView', view);
}
</script>

<template>
  <aside class="sidebar w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
    <div class="px-5 pt-6 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #1f45f5, #4d73ff);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <span class="font-display font-700 text-white text-lg" style="font-weight:700;">{{ appName }}</span>
      </div>
    </div>
    
    <nav class="flex-1 px-3 py-2 space-y-0.5">
      <SidebarNavItem label="Painel" view="dashboard" :active="activeView" @select="handleClick">
        <template #icon>
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </template>
      </SidebarNavItem>
    
      <SidebarNavItem label="Eventos" view="eventos" :active="activeView" @select="handleClick">
        <template #icon>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </template>
        <template #after>
          <span class="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style="background:rgba(31,69,245,0.2);color:#86a5ff;">12</span>
        </template>
      </SidebarNavItem>
    
      <SidebarNavItem label="Participantes" view="participantes" :active="activeView" @select="handleClick">
        <template #icon>
          <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
          <path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/>
        </template>
      </SidebarNavItem>
    
      <SidebarNavItem label="Formulário" view="form" :active="activeView" @select="handleClick">
        <template #icon>
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </template>
        <template #after>
          <span class="ml-auto flex items-center gap-1 text-xs" style="color:#34d399;">
            <span class="dot-live"></span>Ao vivo
          </span>
        </template>
      </SidebarNavItem>
    
      <SidebarNavItem label="Relatórios" view="relatorio" :active="activeView" @select="handleClick">
        <template #icon>
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </template>
      </SidebarNavItem>
    
      <div class="pt-4 pb-1 px-3">
        <span class="text-xs font-semibold uppercase tracking-widest" style="color:#334155;letter-spacing:0.08em;">
          Configurações
        </span>
      </div>
    
      <SidebarNavItem label="Configurações do Sistema">
        <template #icon>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </template>
      </SidebarNavItem>
    </nav>
  </aside>
</template>