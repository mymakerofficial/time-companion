<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { type BadgeVariants, badgeVariants } from '.'
import {cn, type Nullable} from '@/lib/utils'
import {vProvideColor} from '@/directives/vProvideColor'

const props = defineProps<{
  variant?: BadgeVariants['variant']
  size?: BadgeVariants['size']
  class?: HTMLAttributes['class']
  color?: Nullable<string>
}>()
</script>

<template>
  <div v-provide-color="color" :class="cn(badgeVariants({ variant, size }), props.class)">
    <slot />
  </div>
</template>
