<script setup lang="ts">
import { buttonVariants } from '.'
import {cn, isDefined} from '@/lib/utils'

interface Props {
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
  size?: NonNullable<Parameters<typeof buttonVariants>[0]>['size']
  as?: string
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})

const emit = defineEmits<{
  click: []
}>()

// this is a silly fix for using onClick in jsx components
function handleClick() {
  if (isDefined(props.onClick)) {
    props.onClick()
    return
  }

  emit('click')
}
</script>

<template>
  <component
    @click="handleClick"
    :is="as"
    :class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')"
  >
    <slot />
  </component>
</template>
