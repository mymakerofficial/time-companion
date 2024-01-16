<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Settings} from "lucide-vue-next";
</script>

<template>
  <div class="w-16 h-screen border-r border-border">
    <div class="h-16 border-b border-border flex justify-center items-center">
      <Clock class="size-5" />
    </div>
    <div class="flex flex-col items-center gap-4 py-4">
      <Button variant="secondary" size="icon"><Calendar class="size-5" /></Button>
      <Button variant="ghost" size="icon"><Settings class="size-5" /></Button>
    </div>
  </div>
</template>