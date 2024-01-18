<script setup lang="ts">
import {cn} from "@/lib/utils";

withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div',
})
</script>

<template>
  <component :is="as ?? 'div'" :class="cn('w-2/3 mx-auto grid grid-cols-8', $attrs.class ?? '')">
    <slot />
  </component>
</template>