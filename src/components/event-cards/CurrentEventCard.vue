<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {computed, reactive, watch} from "vue";
import {useNow} from "@vueuse/core";
import dayjs from "dayjs";
import {MoreVertical} from "lucide-vue-next";

const emit = defineEmits<{
  createEvent: []
  updateEvent: [displayName: string]
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
    emit('updateEvent', state.input)
  } else {
    emit('updateEvent', state.input)
    emit('endEvent')
    state.startedAt = null
    state.input = ''
  }
}

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
        <time class="text-2xl font-medium tracking-wide">{{ durationLabel }}</time>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button @click="handleStartStop" variant="inverted">{{ state.isRunning ? 'Stop' : 'Start' }}</Button>
        <Button variant="ghost" size="icon"><MoreVertical /></Button>
      </div>
    </div>
  </div>
</template>