<script setup lang="ts">
import {useNow} from "@vueuse/core";
import {computed} from "vue";

const now = useNow({ interval: 900000 }) // update every 15 minutes

const welcomeMessage = computed(() => {
  const hour = now.value.getHours()

  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  }

  if (hour >= 12 && hour < 18) {
    return 'Good Afternoon'
  }

  return 'Good Evening'
})
</script>

<template>
  <div class="h-16 px-8 border-b border-border flex flex-row justify-between items-center gap-8">
    <div>
      <h3 class="text-md font-medium tracking-wide">{{ welcomeMessage }}</h3>
    </div>
  </div>
</template>