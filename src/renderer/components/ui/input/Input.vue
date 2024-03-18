<script setup lang="ts">
import {cn} from '@renderer/lib/utils'
import {computed, type HTMLAttributes, useAttrs} from "vue";
import InputPrimitive from "@renderer/components/ui/input/InputPrimitive.vue";
import {inputContainerVariants, inputInputVariants, type InputVariants} from "@renderer/components/ui/input/index";

export interface InputProps {
  size?: InputVariants['size']
  type?: HTMLAttributes['inputmode']
  class?: HTMLAttributes['class']
  inputClass?: HTMLAttributes['class']
}

export interface InputForwardProps {
  modelValue: string | number
  'onUpdate:modelValue': (value: string | number) => void
  class: HTMLAttributes['class']
  type: HTMLAttributes['inputmode']
  [key: string]: unknown
}

export interface InputSlots {
  leading(): any
  input(props: InputForwardProps): any
  trailing(): any
}

const props = withDefaults(defineProps<InputProps & {
  modelValue?: string | number
}>(), {
  modelValue: '',
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

defineSlots<InputSlots>()

const attrs = useAttrs()

const containerProps = computed(() => {
  return {
    class: cn(inputContainerVariants({ size: props.size }), props.class)
  }
})

const inputProps = computed<InputForwardProps>(() => {
  return {
    modelValue: props.modelValue,
    'onUpdate:modelValue': (value: string | number) => emit('update:modelValue', value),
    class: cn(inputInputVariants({ size: props.size }), props.inputClass),
    type: props.type,
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
