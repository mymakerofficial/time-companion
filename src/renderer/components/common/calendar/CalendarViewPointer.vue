<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTimeNow } from '@renderer/composables/useNow'
import { vProvideColor } from '@renderer/directives/vProvideColor'
import { Duration } from '@shared/lib/datetime/duration'
import { useFormattedDateTime } from '@renderer/composables/datetime/useFormattedDateTime'
import { useCalendarViewPointer } from '@renderer/components/common/calendar/useCalendarView'

const pointer = ref<HTMLElement>()

const now = useTimeNow({ interval: Duration.from({ minutes: 1 }) })
const { containerStyle } = useCalendarViewPointer(now)
const timeLabel = useFormattedDateTime(now.value, {
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
})

function scrollIntoView(behavior: ScrollBehavior) {
  pointer.value?.scrollIntoView({
    block: 'center',
    behavior,
  })
}
function handleClick() {
  scrollIntoView('smooth')
}
watch(now, () => scrollIntoView('smooth'), { immediate: true })
onMounted(() => scrollIntoView('instant'))
</script>

<template>
  <div
    ref="pointer"
    @click="handleClick"
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
