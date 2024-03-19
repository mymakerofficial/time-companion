<script setup lang="ts">
import { cn } from '@renderer/lib/utils'

withDefaults(
  defineProps<{
    as?: string
  }>(),
  {
    as: 'div',
  },
)
</script>

<template>
  <component :is="as ?? 'div'" :class="cn('w-2/3 mx-auto', $attrs.class ?? '')">
    <slot />
  </component>
</template>
