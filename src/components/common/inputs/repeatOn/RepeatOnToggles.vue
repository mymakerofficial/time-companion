<script setup lang="ts">
import {Toggle} from "@/components/ui/toggle";
import {weekDayNames} from "./constants";
import type {RepeatOnWeekdays} from "@/model/calendarReminder";
import {computed} from "vue";

const model = defineModel<RepeatOnWeekdays>({ required: true })

const keys = computed(() => Object.keys(model.value) as (keyof RepeatOnWeekdays)[])
</script>

<template>
  <div class="flex flex-row gap-2">
    <Toggle
      v-for="key in keys"
      :key="`${key}${model[key]}`"
      v-model:pressed="model[key]"
      v-text="weekDayNames[key]"
    />
  </div>
</template>