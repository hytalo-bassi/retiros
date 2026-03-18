<template>
    <div class="px-8 pt-8 pb-6 flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-white">Eventos</h1>
        <p class="text-sm mt-0.5" style="color:#64748b;">Gerencie todos os seus eventos</p>
      </div>
      <button class="btn-primary flex items-center gap-2" onclick="openModal()">
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
          <select class="form-input" style="width:140px;">
            <option>Todos os status</option>
            <option>Próximos</option>
            <option>Ao vivo</option>
            <option>Concluído</option>
          </select>
        </div>
        <div id="full-events-list"></div>
      </div>
    </div>
</template>