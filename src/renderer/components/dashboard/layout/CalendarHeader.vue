<script setup lang="ts">
import { useNow } from '@renderer/composables/useNow'
import { useFormattedDateTime } from '@renderer/composables/datetime/useFormattedDateTime'

const now = useNow()

const dateLabel = useFormattedDateTime(now, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const timeLabel = useFormattedDateTime(now, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
})
</script>

<template>
  <div
    class="h-16 px-8 border-b border-border flex flex-row justify-between items-center gap-8"
  >
    <h3 class="text-md font-medium tracking-wide">{{ dateLabel }}</h3>
    <time class="text-md font-medium tracking-wide">{{ timeLabel }}</time>
  </div>
</template>
