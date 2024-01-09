<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {useNow} from "@vueuse/core";
import dayjs from "dayjs";
import {MoreVertical} from "lucide-vue-next";
import TimeDurationInput from "@/components/TimeDurationInput.vue";
import {minsSinceStartOfDay} from "@/lib/time-utils";

const emit = defineEmits<{
  createEvent: []
  updateEvent: [displayName: string, startedAt: Date]
  endEvent: []
}>()

const now = useNow()

const state = reactive({
  startedAt: null as Date | null,
  input: '',
  isRunning: computed(() => state.startedAt !== null)
})

watch(() => state.input, (value) => {
  if (state.isRunning) {
    emit('updateEvent', value)
  }
})

function handleStartStop() {
  if (!state.isRunning) {
    state.startedAt = now.value
    emit('createEvent')
    emit('updateEvent', state.input, state.startedAt)
  } else {
    emit('updateEvent', state.input, state.startedAt)
    emit('endEvent')
    state.startedAt = null
    state.input = ''
  }
}

const startedAtInMinutesSinceStartOfDay = computed({
  get() {
    if (!state.isRunning) {
      return 0
    }
    return minsSinceStartOfDay(state.startedAt)
  },
  set(value: number) {
    if (!state.isRunning) {
      return
    }
    state.startedAt = dayjs().startOf('day').add(value, 'minute').toDate()
    emit('updateEvent', state.input, state.startedAt)
  }
})

const durationLabel = computed(() => {
  if (!state.isRunning) {
    return '00:00:00'
  }
  // time between now and startedAt in HH:mm:ss
  return dayjs().startOf('day').add(now.value.getTime() - state.startedAt.getTime()).format('HH:mm:ss')
})
</script>

<template>
  <div class="p-8 bg-primary text-primary-foreground flex flex-col gap-2">
    <div class="flex flex-row justify-between items-center gap-8">
      <div class="flex-grow">
        <Input v-model="state.input" placeholder="what are you working on?" class="bg-primary text-primary-foreground border-none font-medium text-xl" />
      </div>
      <div class="flex flex-row items-center gap-8">
        <TimeDurationInput v-if="state.isRunning" v-model="startedAtInMinutesSinceStartOfDay" class="w-16 text-center font-medium text-sm border-none bg-primary text-primary-foreground" />
        <time class="text-2xl font-medium tracking-wide w-24">{{ durationLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleStartStop" variant="inverted">{{ state.isRunning ? 'Stop' : 'Start' }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>