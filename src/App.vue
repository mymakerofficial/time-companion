<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Settings } from 'lucide-vue-next'
import Sidebar from "@/components/Sidebar.vue";
</script>

<template>
  <div class="flex flex-row w-full">
    <Sidebar />
    <RouterView />
  </div>
</template>