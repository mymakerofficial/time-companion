<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import {
  DropdownMenuItem,
  type DropdownMenuItemProps,
  useForwardProps,
} from 'radix-vue'
import { cn } from '@renderer/lib/utils'
import { dropdownMenuItemVariants } from '@shadcn/dropdown-menu/index'

const props = defineProps<
  DropdownMenuItemProps & {
    variant?: NonNullable<
      Parameters<typeof dropdownMenuItemVariants>[0]
    >['variant']
    class?: HTMLAttributes['class']
    inset?: boolean
  }
>()

const delegatedProps = computed(() => {
  const { class: _class, variant: _variant, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(dropdownMenuItemVariants({ variant }), inset && 'pl-8', props.class)
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
