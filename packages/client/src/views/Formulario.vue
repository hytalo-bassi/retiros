<template>
    <div class="px-8 pt-8 pb-6">
      <div class="flex items-center gap-3 mb-1">
        <h1 class="font-display text-2xl font-bold text-white">Check-in ao Vivo</h1>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600" style="background:rgba(16,185,129,0.12);color:#34d399;">
          <span class="dot-live"></span> Ativo
        </div>
      </div>
      <p class="text-sm" style="color:#64748b;">Conferência Tech Brasil 2025 — 15 Jun 2025</p>
    </div>
    <div class="px-8 pb-8 grid grid-cols-3 gap-5">
      <div class="card p-5 col-span-2">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-display font-600 text-white text-sm">Progresso de Check-in</h3>
          <span class="status-badge badge-live">Ao Vivo</span>
        </div>
        <div class="flex items-end gap-2 mb-2">
          <span class="font-display text-5xl font-800 text-white">342</span>
          <span class="text-lg mb-2" style="color:#64748b;">/ 462</span>
        </div>
        <div class="progress-bg w-full mb-1">
          <div class="progress-fill" style="width:74%;background:linear-gradient(90deg,#1f45f5,#4d73ff);"></div>
        </div>
        <p class="text-xs" style="color:#64748b;">74% dos participantes realizaram check-in</p>

        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
            <p class="text-xs" style="color:#64748b;">Confirmados</p>
            <p class="font-display text-xl font-700 text-white mt-1">462</p>
          </div>
          <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
            <p class="text-xs" style="color:#64748b;">Check-in feito</p>
            <p class="font-display text-xl font-700 mt-1" style="color:#34d399;">342</p>
          </div>
          <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
            <p class="text-xs" style="color:#64748b;">Aguardando</p>
            <p class="font-display text-xl font-700 mt-1" style="color:#fbbf24;">120</p>
          </div>
        </div>
      </div>

      <!-- Recent check-ins -->
      <div class="card p-5">
        <h3 class="font-display font-600 text-white text-sm mb-4">Últimos Check-ins</h3>
        <div class="space-y-3" id="recent-checkins"></div>
      </div>

      <!-- Search check-in -->
      <div class="card p-5 col-span-3">
        <h3 class="font-display font-600 text-white text-sm mb-4">Buscar Participante</h3>
        <div class="flex gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:#475569;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="form-input pl-9" placeholder="Nome, e-mail ou código de inscrição..." />
          </div>
          <button class="btn-primary px-6">Confirmar Check-in</button>
        </div>
      </div>
    </div>
</template>