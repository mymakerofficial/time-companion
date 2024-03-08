<script setup lang="ts">
import IconNav from "@/components/common/layout/nav/IconNav.vue";
import type {NavLink} from "@/components/common/layout/nav/nav-link";

defineProps<{
  links: NavLink[]
}>()
</script>

<template>
  <div class="min-w-16 h-screen sticky top-0 bg-neutral-50 dark:bg-neutral-950 border-r border-border pt-20">
    <IconNav :links="links" class="py-2.5" />
  </div>
</template>