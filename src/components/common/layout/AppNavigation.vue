<script setup lang="ts">
import IconNav from "@/components/common/layout/nav/IconNav.vue";
import type {NavLink} from "@/components/common/layout/nav/nav-link";
import {computed} from "vue";
import {cn} from "@/lib/utils";

defineProps<{
  links: NavLink[]
}>()

const customTitleBar = computed(() => {
  // TODO: this is a hack, we should use a proper way to detect electron
  return navigator.userAgent?.includes('Electron')
})
</script>

<template>
  <div :data-custom-title-bar="customTitleBar" class="fixed left-0 top-0 flex flex-col w-screen h-dvh">
    <header v-if="customTitleBar" class="electron-title-bar h-title-bar">
    </header>
    <div class="flex flex-row">
      <div class="min-w-16 sticky top-0 pt-20">
        <IconNav :links="links" class="py-2.5" />
      </div>
      <div
        :class="cn(
        'flex-1 h-viewport bg-background border-l border-border overflow-auto box-content',
          customTitleBar && 'border-t rounded-tl-md'
        )"
      >
        <slot />
      </div>
    </div>
  </div>
</template>