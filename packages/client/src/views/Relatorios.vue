<template>
    <div class="px-8 pt-8 pb-6 flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-white">Relatórios</h1>
        <p class="text-sm mt-0.5" style="color:#64748b;">Análises e exportações</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exportar CSV
      </button>
    </div>
    <div class="px-8 pb-8 grid grid-cols-2 gap-5">
      <div class="card p-5">
        <h3 class="font-display font-600 text-white text-sm mb-4">Participantes por Evento</h3>
        <div id="report-chart" class="flex items-end gap-2" style="height:140px;"></div>
        <div class="flex gap-4 mt-4 flex-wrap" id="report-legend"></div>
      </div>
      <div class="card p-5">
        <h3 class="font-display font-600 text-white text-sm mb-4">Resumo Geral</h3>
        <div class="space-y-3" id="report-summary"></div>
      </div>
    </div>
</template>