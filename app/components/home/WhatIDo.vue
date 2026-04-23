<template>
  <div class="flex w-full flex-col gap-6">
    <h3 class="font-newsreader italic text-white-shadow text-xl">
      {{ $t("what_i_do.title") }}
    </h3>
    <div class="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p class="text-sm text-muted">
        {{ $t("what_i_do.line1") }}
      </p>
      <ul class="flex flex-col gap-2 mt-1">
        <li
          v-for="key in ['item1', 'item2', 'item3']"
          :key="key"
          class="flex items-center gap-3 text-sm"
        >
          <span class="size-1.5 shrink-0 rounded-full bg-white/60" />
          <span>{{ $t(`what_i_do.${key}`) }}</span>
        </li>
      </ul>
      <p class="mt-2 text-sm font-medium text-white/80">
        {{ $t("what_i_do.cta") }}
      </p>
    </div>
  </div>
</template>
