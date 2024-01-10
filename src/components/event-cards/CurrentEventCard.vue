<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {isDef, useNow, whenever} from "@vueuse/core";
import dayjs from "dayjs";
import {MoreVertical} from "lucide-vue-next";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {formatTimeDiff, minutesSinceStartOfDay} from "@/lib/time-utils";
import type {CalendarEvent} from "@/lib/types";
import {isNotNull, isNull, type Nullable} from "@/lib/utils";

const model = defineModel<Nullable<CalendarEvent>>({ required: true })

const emit = defineEmits<{
  startEvent: []
  stopEvent: []
}>()

const now = useNow()

const state = reactive({
  name: '',

  startedAt: computed<Nullable<Date>>({
    get() {
      return model.value?.startedAt || null
    },
    set(value) {
      if (isNull(value) || isNull(model.value)) {
        return
      }

      model.value.startedAt = value
    }
  }),

  startedAtMinutes: computed({
    get() {
      return minutesSinceStartOfDay(model.value?.startedAt)
    },
    set(value: number) {
      if (isNull(model.value)) {
        return
      }

      model.value.startedAt = dayjs().startOf('day').add(value, 'minute').toDate()
    }
  }),

  isRunning: computed(() => isNotNull(model.value))
})

whenever(() => state.isRunning, () => {
  if (isNull(model.value)) {
    return
  }

  if (isNotNull(model.value.projectDisplayName)) {
    // if a name is already set by the parent, use that
    state.name = model.value.projectDisplayName
  } else {
    // otherwise, use the input value
    model.value.projectDisplayName = state.name
  }
})

watch(() => state.name, () => {
  if (isNull(model.value)) {
    return
  }

  model.value.projectDisplayName = state.name
})

function handleStartStop() {
  if (!state.isRunning) {
    emit('startEvent')
  } else {
    emit('stopEvent')
  }
}

const durationLabel = computed(() => {
  if (isNull(state.startedAt)) {
    return '00:00:00'
  }

  // time between now and startedAt in HH:mm:ss
  return formatTimeDiff(state.startedAt, now.value)
})
</script>

<template>
  <div class="p-8 bg-primary text-primary-foreground flex flex-col gap-2">
    <div class="flex flex-row justify-between items-center gap-8">
      <div class="flex-grow">
        <Input v-model="state.name" placeholder="what are you working on?" class="bg-primary text-primary-foreground border-none font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center gap-8">
        <TimeDurationInput v-if="state.isRunning" v-model="state.startedAtMinutes" class="w-16 text-center font-medium text-sm border-none bg-primary text-primary-foreground" />
        <time class="text-2xl font-medium tracking-wide w-24">{{ durationLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleStartStop" variant="inverted">{{ state.isRunning ? 'Stop' : 'Start' }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>