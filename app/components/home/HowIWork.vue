<template>
  <div class="flex w-full flex-col gap-6">
    <h3 class="font-newsreader italic text-white-shadow text-xl">
      {{ $t("how_i_work.title") }}
    </h3>
    <div class="flex flex-col gap-3 sm:flex-row">
      <div
        v-for="(step, i) in steps"
        :key="step"
        class="flex flex-1 flex-col gap-2 rounded-xl border p-5 transition-colors"
        :class="i === 0 ? 'border-white/20 bg-white/[0.05]' : i === 2 ? 'border-white/5 bg-white/[0.02] opacity-70' : 'border-white/10 bg-white/[0.03]'"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-muted">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="text-sm font-semibold" :class="i === 0 ? 'text-white' : 'text-white/80'">
            {{ $t(`how_i_work.step${i + 1}_title`) }}
          </span>
        </div>
        <p class="text-xs text-muted leading-relaxed">
          {{ $t(`how_i_work.step${i + 1}_desc`) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const steps = ['diagnosis', 'architecture', 'implementation']
</script>
