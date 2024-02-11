<script setup lang="ts">
import {cn} from '@/lib/utils'
import {computed, type HTMLAttributes, useAttrs} from "vue";
import {useEmitAsProps} from "radix-vue";
import InputPrimitive from "@/components/ui/input/InputPrimitive.vue";

const props = withDefaults(defineProps<{
  modelValue: string | number
  type?: HTMLAttributes['inputmode']
  class?: HTMLAttributes['class']
  inputClass?: HTMLAttributes['class']
}>(), {
  type: 'text',
  class: '',
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

const containerProps = computed(() => {
  const { class: className } = props
  return {
    class: cn('flex items-center h-10 w-full overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2', className)
  }
})

const inputProps = computed(() => {
  const { type, inputClass } = props

  return {
    modelValue: props.modelValue,
    ...useEmitAsProps(emit),
    type,
    class: cn('h-full w-full first:pl-3 last:pr-3 py-2 bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', inputClass),
    ...attrs,
  }
})
</script>

<template>
  <div v-bind="containerProps">
    <slot name="leading" />
    <slot name="input" v-bind="inputProps">
      <InputPrimitive v-bind="inputProps" />
    </slot>
    <slot name="trailing" />
  </div>
</template>
