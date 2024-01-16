<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Calendar, Settings} from "lucide-vue-next";
import logo from '@/assets/logo.png'
</script>

<template>
  <div class="min-w-16 h-screen border-r border-border">
    <div class="h-16 border-b border-border flex justify-center items-center">
      <img :src="logo" alt="logo" class="h-8" />
    </div>
    <div class="flex flex-col items-center gap-4 py-4">
      <Button variant="secondary" size="icon"><Calendar class="size-5" /></Button>
      <Button variant="ghost" size="icon"><Settings class="size-5" /></Button>
    </div>
  </div>
</template>