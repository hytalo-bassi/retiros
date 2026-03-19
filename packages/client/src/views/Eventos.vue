<script setup lang="ts">
import { ref } from 'vue';

const adicionarEventos = ref(false);
const nomeEvento = ref('');
const slugEvento = ref('');
const inscricoesDE = ref('');
const inscricoesAte = ref('');
const camposPersonalizados = ref<{ id: number; nome: string; tipo: string }[]>([]);
 
function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}
 
function onNomeInput() {
  slugEvento.value = gerarSlug(nomeEvento.value);
}
 
function adicionarCampo() {
  camposPersonalizados.value.push({
    id: Date.now(),
    nome: '',
    tipo: 'text',
  });
}
 
function removerCampo(id: number) {
  camposPersonalizados.value = camposPersonalizados.value.filter(c => c.id !== id);
}

</script>

<template>
  <div v-if="adicionarEventos" class="pl-24 pr-32 pt-8 pb-12 flex items-center justify-between w-full">
    <div class="px-8 pt-8 pb-12 flex flex-col justify-between w-full">
      <button class="flex items-center gap-2 pb-8" style="color:#64748b;" @click="adicionarEventos = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
          <path d="M8 17L3 12M3 12L8 7M3 12H21" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Voltar para Eventos
      </button>
      <div>
        <h1 class="font-display text-2xl font-bold text-white">Registrar novo evento</h1>
        <p class="text-sm mt-0.5" style="color:#64748b;">Preencha todos os dados para adicionar um novo evento</p>
      </div>
      <div class="rounded-2xl overflow-hidden mt-8" style="background:#161b27; border:1px solid rgba(255,255,255,0.07);">
        <div class="flex">
          <div class="w-1 flex-shrink-0" style="background:linear-gradient(to bottom,#3b5bdb,#5c7cfa);"></div>
          <div class="flex-1 p-8 flex flex-col gap-6">
 
            <h2 class="text-white text-lg font-bold tracking-tight">Informações Básicas</h2>
 
            <!-- Nome do Evento -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold uppercase tracking-widest" style="color:#64748b;">
                Nome do Evento <span class="text-red-400 ml-0.5">*</span>
              </label>
              <input
                v-model="nomeEvento"
                @input="onNomeInput"
                type="text"
                placeholder="Ex: Summit Anual 2024"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition"
                style="background:#0f1117; border:1px solid rgba(255,255,255,0.09);"
                @focus="($event.target as HTMLInputElement).style.borderColor='#3b5bdb'"
                @blur="($event.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.09)'"
              />
            </div>
 
            <!-- Apelido (URL Slug) -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold uppercase tracking-widest" style="color:#64748b;">
                  Apelido (URL Slug) <span class="text-red-400 ml-0.5">*</span>
                </label>
                <span class="text-xs font-medium px-3 py-1 rounded-full" style="background:rgba(59,91,219,0.15);color:#5c7cfa;">
                  Gerado automaticamente
                </span>
              </div>
              <div
                class="flex items-center rounded-xl overflow-hidden"
                style="background:#0f1117; border:1px solid rgba(255,255,255,0.09);"
              >
                <span class="pl-4 pr-1 text-sm select-none" style="color:#475569;">/</span>
                <input
                  v-model="slugEvento"
                  type="text"
                  placeholder="summit_anual_2024"
                  class="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>
 
            <!-- Inscrições De / Até -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold uppercase tracking-widest" style="color:#64748b;">
                  Inscrições De <span class="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  v-model="inscricoesDE"
                  type="date"
                  class="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style="background:#0f1117; border:1px solid rgba(255,255,255,0.09); color:#94a3b8; color-scheme:dark;"
                  @focus="($event.target as HTMLInputElement).style.borderColor='#3b5bdb'"
                  @blur="($event.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.09)'"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold uppercase tracking-widest" style="color:#64748b;">
                  Inscrições Até <span class="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  v-model="inscricoesAte"
                  type="date"
                  class="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style="background:#0f1117; border:1px solid rgba(255,255,255,0.09); color:#94a3b8; color-scheme:dark;"
                  @focus="($event.target as HTMLInputElement).style.borderColor='#3b5bdb'"
                  @blur="($event.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.09)'"
                />
              </div>
            </div>
 
          </div>
        </div>
      </div>
 
      <!-- ── CARD: Campos Personalizados ── -->
      <div class="rounded-2xl overflow-hidden my-4" style="background:#161b27; border:1px solid rgba(255,255,255,0.07);">
        <div class="flex">
          <div class="w-1 flex-shrink-0" style="background:linear-gradient(to bottom,#f472b6,#fb7185);"></div>
          <div class="flex-1 p-8 flex flex-col gap-5">
 
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-white text-lg font-bold tracking-tight">Campos Personalizados</h2>
                <p class="text-sm mt-1" style="color:#475569;">Adicione campos extras ao formulário de inscrição do usuário.</p>
              </div>
              <button
                @click="adicionarCampo"
                class="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                style="background:rgba(20,184,166,0.15);color:#2dd4bf;"
                @mouseenter="($event.target as HTMLElement).style.background='rgba(20,184,166,0.25)'"
                @mouseleave="($event.target as HTMLElement).style.background='rgba(20,184,166,0.15)'"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar Campo
              </button>
            </div>
 
            <div
              v-if="camposPersonalizados.length === 0"
              class="rounded-xl py-10 flex flex-col items-center gap-1"
              style="border:1.5px dashed rgba(255,255,255,0.07);"
            >
              <p class="text-sm font-medium" style="color:#334155;">Nenhum campo personalizado adicionado.</p>
              <p class="text-xs" style="color:#1e293b;">Clique no botão acima para adicionar.</p>
            </div>
 
            <div v-else class="flex flex-col gap-3">
              <div
                v-for="campo in camposPersonalizados"
                :key="campo.id"
                class="flex items-center gap-3 rounded-xl px-4 py-3"
                style="background:#0f1117; border:1px solid rgba(255,255,255,0.07);"
              >
                <input
                  v-model="campo.nome"
                  type="text"
                  placeholder="Nome do campo"
                  class="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                />
                <select
                  v-model="campo.tipo"
                  class="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                  style="background:#161b27; border:1px solid rgba(255,255,255,0.09); color:#94a3b8;"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="email">E-mail</option>
                  <option value="select">Seleção</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <button
                  @click="removerCampo(campo.id)"
                  class="transition-colors"
                  style="color:#334155;"
                  @mouseenter="($event.target as HTMLElement).style.color='#f87171'"
                  @mouseleave="($event.target as HTMLElement).style.color='#334155'"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
 
          </div>
        </div>
      </div>
      <div class="w-full flex flex-row">
        <div class="ml-auto">
          <button @click="adicionarEventos = false">Cancelar</button>
          <button class="btn-primary font-bold ml-8">Registrar Evento</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="px-8 pt-8 pb-12 flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-white">Eventos</h1>
        <p class="text-sm mt-0.5" style="color:#64748b;">Gerencie todos os seus eventos</p>
      </div>
      <button class="btn-primary flex items-center gap-2" @click="adicionarEventos = true">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Evento
      </button>
    </div>
    <div class="px-8">
      <div class="card overflow-hidden">
        <div class="px-6 py-4 flex items-center gap-4" style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <div class="relative flex-1 max-w-xs">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:#475569;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input w-full" placeholder="Buscar evento..." style="width:100%;" />
          </div>
          <span class="ml-auto">0 eventos encontrados</span>
        </div>
        <div>
          <table class="w-full">
            <thead>
              <tr style="color:#94a3b8;">
                <th class="text-left py-3 px-6">Nome</th>
                <th class="text-left py-3 px-6">Status</th>
                <th class="text-left py-3 px-6">Inscritos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="py-3 px-6">Evento de Teste</td>
                <td class="py-3 px-6">Rascunho</td>
                <td class="py-3 px-6">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>