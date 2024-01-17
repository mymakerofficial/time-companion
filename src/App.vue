<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from "@/components/nav/AppSidebar.vue";
import {TooltipProvider} from "radix-vue"
import type {NavLink} from "@/components/nav/nav-link";
import {Archive, Calendar, Settings} from "lucide-vue-next";

const links: NavLink[] = [
  {label: 'Dashboard', to: { name: 'app-dashboard' }, icon: Calendar},
  {label: 'Report', to: { name: 'app-report' }, icon: Archive},
  {label: 'Settings', to: { name: 'app-settings' }, icon: Settings},
]
</script>

<template>
  <TooltipProvider>
    <div class="flex flex-row w-full">
      <AppSidebar :links="links" />
      <RouterView />
    </div>
  </TooltipProvider>
</template>