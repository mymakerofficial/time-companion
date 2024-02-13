<script setup lang="ts">
import {cn} from '@/lib/utils'
import {computed, type HTMLAttributes, useAttrs} from "vue";
import {useEmitAsProps} from "radix-vue";
import InputPrimitive from "@/components/ui/input/InputPrimitive.vue";
import {inputContainerVariants, inputInputVariants, type InputVariants} from "@/components/ui/input/index";

const props = withDefaults(defineProps<{
  modelValue?: string | number
  size?: InputVariants['size']
  type?: HTMLAttributes['inputmode']
  class?: HTMLAttributes['class']
  inputClass?: HTMLAttributes['class']
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

const attrs = useAttrs()

const containerProps = computed(() => {
  const { size, class: className } = props

  return {
    class: cn(inputContainerVariants({ size }), className)
  }
})

const inputProps = computed(() => {
  const { type, size, inputClass } = props

  return {
    modelValue: props.modelValue,
    ...useEmitAsProps(emit),
    type,
    class: cn(inputInputVariants({ size }), inputClass),
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
