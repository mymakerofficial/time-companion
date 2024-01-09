<script setup lang="ts">
import {MoreVertical} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ref} from "vue";

const name = ref<string>('')
const startedAtInput = ref<string>('')
const endedAtInput = ref<string>('')
const timeInput = ref<string>('')
</script>

<template>
  <div class="p-8 border-b border-border">
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex-grow">
        <Input v-model="name" class="font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center">
        <Input v-model="startedAtInput" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
        <span class="text-accent">-</span>
        <Input v-model="endedAtInput" placeholder="00:00" class="w-16 text-center font-medium text-sm border-none" />
      </div>
      <div>
        <Input v-model="timeInput" placeholder="00:00" class="w-20 text-center font-medium text-xl border-none" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button>Continue</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>