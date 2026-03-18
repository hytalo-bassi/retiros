<template>
    <div class="px-8 pt-8 pb-6 flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-white">Participantes</h1>
        <p class="text-sm mt-0.5" style="color:#64748b;">1.847 participantes cadastrados</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Participante
      </button>
    </div>
    <div class="px-8 pb-8">
      <div class="card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <th class="px-6 py-3 text-left text-xs font-600 uppercase tracking-widest" style="color:#475569;">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-600 uppercase tracking-widest" style="color:#475569;">E-mail</th>
              <th class="px-6 py-3 text-left text-xs font-600 uppercase tracking-widest" style="color:#475569;">Evento</th>
              <th class="px-6 py-3 text-left text-xs font-600 uppercase tracking-widest" style="color:#475569;">Status</th>
              <th class="px-6 py-3 text-left text-xs font-600 uppercase tracking-widest" style="color:#475569;">Credencial</th>
            </tr>
          </thead>
          <tbody id="participants-table"></tbody>
        </table>
      </div>
    </div>
</template>