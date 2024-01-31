<script setup lang="ts">
import {cn} from '@/lib/utils'

const props = withDefaults(defineProps<{
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  class?: string
  inputClass?: string
}>(), {
  type: 'text',
  class: '',
  inputClass: '',
})

const model = defineModel<string | number>({ required: false })
</script>

<template>
  <div :class="cn('flex items-center h-10 w-full overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2', props.class)">
    <slot name="leading" />
    <input v-model="model" :type="type" :placeholder="placeholder" :class="cn('h-full w-full first:pl-3 last:pr-3 py-2 bg-transparent  file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', props.inputClass)">
    <slot name="trailing" />
  </div>
</template>
