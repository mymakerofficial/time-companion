<script setup lang="ts">
import {Calendar, Settings} from "lucide-vue-next";
import logo from '@/assets/logo.png'
import Nav, {type NavLink} from "@/components/Nav.vue";

const links: NavLink[] = [
  {label: 'Dashboard', to: { name: 'home' }, icon: Calendar},
  {label: 'Settings', to: { name: 'settings' }, icon: Settings},
]
</script>

<template>
  <div class="min-w-16 h-screen border-r border-border">
    <div class="h-16 border-b border-border flex justify-center items-center">
      <img :src="logo" alt="logo" class="h-8" />
    </div>
    <Nav :links="links" />
  </div>
</template>