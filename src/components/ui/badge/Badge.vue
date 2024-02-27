<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { type BadgeVariants, badgeVariants } from '.'
import {cn, type Nullable} from '@/lib/utils'
import {vProvideColor} from '@/directives/vProvideColor'
import {Primitive, type PrimitiveProps} from "radix-vue";

const props = defineProps<{
  as?: PrimitiveProps['as']
  variant?: BadgeVariants['variant']
  size?: BadgeVariants['size']
  class?: HTMLAttributes['class']
  color?: Nullable<string>
}>()
</script>

<template>
  <Primitive :as="props.as" v-provide-color="color" :class="cn(badgeVariants({ variant, size }), props.class)">
    <slot />
  </Primitive>
</template>
