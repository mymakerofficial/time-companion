<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { durationToGridRows } from '@renderer/lib/calendarUtils'
import {
  durationSinceStartOfDay,
  formatTime,
  minutes,
  withFormat,
} from '@renderer/lib/neoTime'
import { useNow } from '@renderer/composables/useNow'
import { useTimeoutFn } from '@vueuse/core'
import { vProvideColor } from '@renderer/directives/vProvideColor'

const pointer = ref<HTMLElement | null>(null)

const now = useNow({ interval: minutes(1) })

const containerStyle = computed(() => {
  const startOffset = 2 // due to spacing at the top
  return {
    gridRow:
      durationToGridRows(durationSinceStartOfDay(now.value)) + startOffset,
  }
})

function scrollIntoView() {
  pointer.value?.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  })
}

watch(
  now,
  () => {
    useTimeoutFn(scrollIntoView, 10)
  },
  { immediate: true },
)

const timeLabel = computed(() => {
  return formatTime(now.value, withFormat('HH:mm'))
})
</script>

<template>
  <div
    ref="pointer"
    @click="scrollIntoView"
    v-provide-color="'rose'"
    class="col-start-1 col-span-full h-0.5 bg-color z-10"
    :style="containerStyle"
  >
    <span
      class="absolute w-14 h-10 -ml-[5em] -mt-10 bg-gradient-to-b via-70% from-transparent via-background to-background"
    />
    <span
      class="absolute w-14 h-10 -ml-[5em] -mt-0 bg-gradient-to-t via-70% from-transparent via-background to-background"
    />
    <span
      class="absolute w-10 h-5 -ml-8 -mt-[0.55rem] rounded-md bg-color text-color-foreground flex items-center justify-center"
    >
      <time class="text-xs font-medium select-none">{{ timeLabel }}</time>
    </span>
    <span
      class="absolute right-0 w-0.5 h-4 -mr-0.5 -mt-[0.45rem] rounded-md bg-color"
    />
  </div>
</template>
