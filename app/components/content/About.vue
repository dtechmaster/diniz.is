<script setup lang="ts">
const stack = await queryCollection('stack').first()
</script>

<template>
  <section class="mx-auto mt-4 flex max-w-4xl flex-col p-7 sm:mt-20 text-[var(--ui-text-toned)]">
    <h1 class="font-newsreader italic text-white-shadow text-center text-4xl">
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </h1>
    <h2 class="text-center text-lg font-extralight italic text-muted">
      <slot
        name="subtitle"
        mdc-unwrap="p"
      />
    </h2>
    <Divider class="mb-8 mt-2" />
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AboutProfilePicture />
      <div class="relative flex flex-col gap-3 sm:ml-4">
        <h3 class="text-lg">
          Intro
        </h3>
        <div class="flex flex-col gap-4 text-primary">
          <slot
            name="intro"
            mdc-unwrap="p"
          />
        </div>
        <AboutSignature class="absolute -bottom-24 right-0 hidden w-40 sm:block" />
        <AboutSignature class="black absolute -bottom-24 -right-2 w-32 sm:hidden" />
      </div>
    </div>
    <Divider class="my-8" />
    <slot
      name="experiences"
      mdc-unwrap="p"
    />
    <Divider class="my-8" />
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-1">
        <h3 class="text-white-shadow font-newsreader italic text-3xl">
          <slot
            name="stack_title"
            mdc-unwrap="p"
          />
        </h3>
        <p>
          <slot
            name="stack_description"
            mdc-unwrap="p"
          />
        </p>
      </div>
      <div
        v-for="category in stack!.categories"
        :key="category.name"
        class="flex flex-col gap-3"
      >
        <h4 class="text-xs font-semibold uppercase tracking-widest text-muted">
          {{ category.name }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="item in category.items"
            :key="item.name"
            :to="item.link"
            target="_blank"
            :aria-label="item.name"
            class="flex items-center gap-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-muted)] px-3 py-2 text-sm text-[var(--ui-text-toned)] transition-colors hover:border-[var(--ui-border-accented)] hover:text-[var(--ui-text)]"
          >
            <UIcon
              :name="item.icon"
              class="size-4 shrink-0"
              :font-controlled="false"
            />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
