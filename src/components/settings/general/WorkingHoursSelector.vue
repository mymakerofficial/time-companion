<script setup lang="ts">
import TimeInput from "@/components/common/inputs/timeInput/TimeInput.vue";
import {ref} from "vue";
import {durationToTime, hours} from "@/lib/neoTime";

const workingHours = ref(durationToTime(hours(8)))
</script>

<template>
  <div class="flex items-center gap-2">
    <TimeInput v-model="workingHours" class="w-16" input-class="text-center"/>
    <span class="text-muted-foreground">h/day</span>
  </div>
</template>