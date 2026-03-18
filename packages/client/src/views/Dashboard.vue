<template>
    <div id="view-dashboard">
        <div class="px-8 pt-8 pb-6 flex items-center justify-between">
          <div>
            <h1 class="font-display text-2xl font-bold text-white">Painel</h1>
            <p class="text-sm mt-0.5" style="color:#64748b;">Visão geral das inscrições de retiro-2026</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:#475569;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input class="search-input" placeholder="Buscar eventos..." />
            </div>
            <button class="btn-primary flex items-center gap-2" onclick="openModal()">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Novo Evento
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="px-8 grid grid-cols-4 gap-4 mb-6">
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-4">
              <p class="text-xs font-600 uppercase tracking-widest" style="color:#475569;">Pagamentos</p>
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(31,69,245,0.12);">
                <svg width="14" height="14" fill="none" stroke="#4d73ff" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            <p class="font-display text-3xl font-800 text-white">1.230</p>
            <p class="text-xs mt-1" style="color:#34d399;">↑ 203 esta semana</p>
          </div>
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-4">
              <p class="text-xs font-600 uppercase tracking-widest" style="color:#475569;">Participantes</p>
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(16,185,129,0.12);">
                <svg width="14" height="14" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
              </div>
            </div>
            <p class="font-display text-3xl font-800 text-white">1.847</p>
            <p class="text-xs mt-1" style="color:#34d399;">↑ 12% vs ano anterior</p>
          </div>
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-4">
              <p class="text-xs font-600 uppercase tracking-widest" style="color:#475569;">Inscrições Hoje</p>
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(245,158,11,0.12);">
                <svg width="14" height="14" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
            </div>
            <p class="font-display text-3xl font-800 text-white">342</p>
            <p class="text-xs mt-1" style="color:#fbbf24;">74% do esperado</p>
          </div>
          <div class="stat-card p-5">
            <div class="flex items-start justify-between mb-4">
              <p class="text-xs font-600 uppercase tracking-widest" style="color:#475569;">Taxa de Pagamento</p>
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(139,92,246,0.12);">
                <svg width="14" height="14" fill="none" stroke="#a78bfa" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="18" y1="20" x2="18" y2="10"/></svg>
              </div>
            </div>
            <p class="font-display text-3xl font-800 text-white">86%</p>
            <p class="text-xs mt-1" style="color:#34d399;">Falta menos de 20%</p>
          </div>
        </div>

        <div class="px-8 grid grid-cols-3 gap-5 pb-8">

          <div class="col-span-2 card p-0 overflow-hidden">
            <div class="px-6 py-4 flex items-center justify-between" style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <h2 class="font-display font-600 text-white text-base">Últimas incrições</h2>
              <div class="flex gap-1">
                <span class="ml-auto flex items-center gap-1 text-xs" style="color:#34d399;">
                  <span class="dot-live"></span>Ao vivo
                </span>
              </div>
            </div>
            <div id="events-list">
              <!-- rows injected by JS -->
            </div>
          </div>

          <!-- Right column -->
          <div class="space-y-5">
            <!-- Occupation chart -->
            <div class="card p-5">
              <h3 class="font-display font-600 text-white text-sm mb-4">Entradas no caixa</h3>
              <p class="font-display text-3xl font-800 text-white" style="color:#34d399;">R$ 30.000</p>
            </div>

            <div class="card p-5">
              <h3 class="font-display font-600 text-white text-sm mb-3">Ações Rápidas</h3>
              <div class="space-y-2">
                <button onclick="showView('checkin')" class="w-full btn-ghost flex items-center gap-3 text-left text-sm">
                  <svg width="15" height="15" fill="none" stroke="#4d73ff" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  Iniciar Inscrição
                </button>
                <button onclick="showView('participants')" class="w-full btn-ghost flex items-center gap-3 text-left text-sm">
                  <svg width="15" height="15" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                  Procurar Participante
                </button>
                <button onclick="showView('reports')" class="w-full btn-ghost flex items-center gap-3 text-left text-sm">
                  <svg width="15" height="15" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Exportar Relatório
                </button>
              </div>
            </div>

            <!-- Recent activity -->
            <div class="card p-5">
              <h3 class="font-display font-600 text-white text-sm mb-4">Atividade Recente</h3>
              <div class="space-y-3" id="activity-feed"></div>
            </div>
          </div>
        </div>
    </div>
</template>