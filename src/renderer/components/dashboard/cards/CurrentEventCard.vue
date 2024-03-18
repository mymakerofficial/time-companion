<script setup lang="ts">
import {computed} from "vue";
import {watchDebounced} from "@vueuse/core";
import {isDefined, isNotDefined, isNull} from "@renderer/lib/utils";
import {useNow} from "@renderer/composables/useNow";
import {durationBetween, durationZero, humanizeDuration} from "@renderer/lib/neoTime";
import DateTimeInput from "@renderer/components/common/inputs/timeInput/DateTimeInput.vue";
import DashboardSection from "@renderer/components/dashboard/cards/DashboardSection.vue";
import {Clock} from "lucide-vue-next";
import CurrentEventInput from "@renderer/components/common/inputs/currentEventInput/CurrentEventInput.vue";
import {type StartEventProps, useActiveEventService} from "@renderer/services/activeEventService";

const activeEventService = useActiveEventService()

const now = useNow()

const event = computed(() => activeEventService.event)

watchDebounced(() => event.value?.project, (value) => {
  if (isDefined(value)) {
    value.lastUsedNow()
  }
}, { debounce: 500 })

watchDebounced(() => event.value?.activity, (value) => {
  if (isDefined(value)) {
    value.lastUsedNow()
  }
}, { debounce: 500 })

function handleStart(partialEvent: StartEventProps) {
  activeEventService.startEvent(partialEvent)
}

function handleStop() {
  activeEventService.stopEvent()
}

const isRunning = computed(() => isDefined(event.value?.startAt) && isNotDefined(event.value?.endAt))

const duration = computed(() => {
  if (isNull(event.value)) {
    return durationZero()
  }

  return durationBetween(event.value.startAt, now.value)
})

const durationLabel = computed(() => {
  return humanizeDuration(duration.value, {
    includeSeconds: true,
  })
})
</script>

<template>
  <DashboardSection>
    <div class="flex flex-row justify-between items-center gap-4">
      <CurrentEventInput
        v-model="event"
        @start="handleStart"
        @stop="handleStop"
      />
      <div v-if="isRunning" class="flex items-center gap-4">
        <DateTimeInput v-if="event!.startAt" v-model="event!.startAt" placeholder="00:00" size="sm" class="border-none h-11 w-fit text-sm" input-class="w-12" v-slot:leading>
          <Clock class="mx-3 size-4 text-muted-foreground" />
        </DateTimeInput>
        <time class="text-lg font-medium text-center min-w-24">{{ durationLabel }}</time>
      </div>
    </div>
  </DashboardSection>
</template>