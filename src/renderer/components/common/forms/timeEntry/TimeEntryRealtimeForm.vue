<script setup lang="ts">
import TimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/TimeEntryInput.vue'
import DateTimeInput from '@renderer/components/common/inputs/timeInput/DateTimeInput.vue'
import { ArrowRight, Clock } from 'lucide-vue-next'
import { type TimeEntryBase, timeEntrySchema } from '@shared/model/timeEntry'
import { reactive, watch } from 'vue'
import { getSchemaDefaults } from '@shared/lib/helpers/getSchemaDefaults'
import { useUntil } from '@renderer/composables/datetime/useUntil'
import DurationInput from '@renderer/components/common/inputs/timeInput/DurationInput.vue'

const props = defineProps<{
  timeEntry: Partial<TimeEntryBase>
}>()
const emit = defineEmits<{
  change: [values: TimeEntryBase]
}>()

const values = reactive<TimeEntryBase>({
  ...getSchemaDefaults(timeEntrySchema),
})

watch(
  () => props.timeEntry,
  (timeEntry) => {
    Object.assign(values, timeEntry)
  },
  {
    immediate: true,
  },
)

const duration = useUntil(values.startedAt, values.stoppedAt)

function handleChange() {
  emit('change', { ...values })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <TimeEntryInput
      v-model:project-id="values.projectId"
      v-model:description="values.description"
      @change="handleChange"
    />
    <div class="flex flex-row items-center gap-2">
      <DateTimeInput
        v-model="values.startedAt"
        @change="handleChange"
        class="flex-1"
        #leading
      >
        <Clock class="mx-3 size-4 text-muted-foreground" />
      </DateTimeInput>
      <DateTimeInput
        v-if="values.stoppedAt"
        v-model="values.stoppedAt"
        @change="handleChange"
        class="flex-1"
        #leading
      >
        <ArrowRight class="mx-3 size-4 text-muted-foreground" />
      </DateTimeInput>
      <DurationInput
        v-if="values.stoppedAt"
        v-model="duration"
        class="w-fit"
        input-class="w-24 text-center"
      />
    </div>
  </div>
</template>
