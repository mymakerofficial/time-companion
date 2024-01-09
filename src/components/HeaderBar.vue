<script setup lang="ts">
import {useDark, useToggle} from "@vueuse/core";
import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-vue-next";

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <header class="sticky top-0 z-40">
    <div class="h-14 bg-background border-b border-border px-8 flex flex-row items-center justify-between">
      <div>
        <span class="font-medium tracking-wide">Time Companion</span>
      </div>
      <div>
        <Button @click="toggleDark()" size="icon" variant="ghost">
          <Moon v-if="isDark" class="size-4" />
          <Sun v-else class="size-4" />
        </Button>
      </div>
    </div>
  </header>
</template>