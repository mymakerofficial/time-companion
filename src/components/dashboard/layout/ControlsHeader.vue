<script setup lang="ts">
import {useNow} from "@vueuse/core";
import {computed} from "vue";
import {useI18n} from "vue-i18n";

const now = useNow({ interval: 900000 }) // update every 15 minutes
const { t } = useI18n()

const welcomeMessage = computed(() => {
  const hour = now.value.getHours()

  if (hour >= 5 && hour < 11) {
    return t('dashboard.header.greeting.morning')
  }

  if (hour >= 11 && hour < 13) {
    return t('dashboard.header.greeting.noon')
  }

  if (hour >= 13 && hour < 18) {
    return t('dashboard.header.greeting.afternoon')
  }

  return t('dashboard.header.greeting.evening')
})
</script>

<template>
  <div class="h-16 px-8 border-b border-border flex flex-row justify-between items-center gap-8">
    <div>
      <h3 class="text-md font-medium tracking-wide">{{ welcomeMessage }}</h3>
    </div>
  </div>
</template>