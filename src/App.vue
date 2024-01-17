<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from "@/components/Sidebar.vue";
import {TooltipProvider} from "radix-vue"
</script>

<template>
  <TooltipProvider>
    <div class="flex flex-row w-full">
      <Sidebar />
      <RouterView />
    </div>
  </TooltipProvider>
</template>