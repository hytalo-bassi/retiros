<script setup lang="ts">
import type { AppViews } from '../types';

interface Props {
  label: string
  view?: AppViews
  active?: AppViews
}
defineProps<Props>()
const emits = defineEmits(['select']);
</script>

<template>
  <button
    class="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left"
    :class="view === active && view ? 'active' : 'text-slate-400'"
    @click="() => emits('select', view ?? label.toLowerCase())"
  >
    <svg class="nav-icon w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <slot name="icon" />
    </svg>

    {{ label }}

    <slot name="after" />
  </button>
</template>