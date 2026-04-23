<script setup lang="ts">
const workItems = [
  { titleKey: 'global.work_items.automation_title', descKey: 'global.work_items.automation_desc' },
  { titleKey: 'global.work_items.ai_title', descKey: 'global.work_items.ai_desc' },
  { titleKey: 'global.work_items.embedded_title', descKey: 'global.work_items.embedded_desc' },
]
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <h3 class="font-newsreader italic text-white-shadow text-xl">
      {{ $t("global.selected_work") }}
    </h3>
    <div class="flex w-full flex-col gap-3">
      <div
        v-for="item in workItems"
        :key="item.titleKey"
        class="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <span class="text-sm font-medium text-white/90">{{ $t(item.titleKey) }}</span>
        <span class="text-xs text-muted">{{ $t(item.descKey) }}</span>
      </div>
    </div>
    <NuxtLinkLocale to="/works">
      <span class="font-newsreader italic text-white-shadow cursor-pointer">
        {{ $t("global.see_more") }}
      </span>
    </NuxtLinkLocale>
  </div>
</template>
