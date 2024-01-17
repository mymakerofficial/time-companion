<script setup lang="ts">
import logo from '@/assets/logo.png'
import IconNav from "@/components/nav/IconNav.vue";
import type {NavLink} from "@/components/nav/nav-link";

defineProps<{
  links: NavLink[]
}>()
</script>

<template>
  <div class="min-w-16 h-screen sticky top-0 border-r border-border">
    <div class="h-16 border-b border-border flex justify-center items-center">
      <img :src="logo" alt="logo" class="h-8" />
    </div>
    <IconNav :links="links" class="py-4" />
  </div>
</template>