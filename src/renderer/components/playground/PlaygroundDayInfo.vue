<script setup lang="ts">
import { Label } from '@shadcn/label'
import { useGetDay } from '@renderer/composables/queries/days/useGetDay'

const props = defineProps<{
  dayId: string
}>()

const { data: day } = useGetDay(props.dayId)
</script>

<template>
  <div class="flex flex-col gap-4" v-if="day">
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">dayId</Label>
      <div class="col-span-3">
        {{ day.id }}
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">dayDate</Label>
      <div class="col-span-3">
        {{ day.date.toString() }}
      </div>
    </div>
  </div>
</template>
