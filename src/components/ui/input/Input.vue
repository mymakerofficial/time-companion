<script setup lang="ts">
import {cn} from '@/lib/utils'
import {Primitive, type PrimitiveProps} from "radix-vue";
import {computed, type HTMLAttributes} from "vue";

const model = defineModel<string | number>({ required: false })

const props = withDefaults(defineProps<Omit<PrimitiveProps, 'asChild'> & {
  type?: HTMLAttributes['inputmode']
  placeholder?: HTMLAttributes['placeholder']
  class?: HTMLAttributes['class']
  inputClass?: HTMLAttributes['class']
}>(), {
  as: 'input',
  type: 'text',
  class: '',
  inputClass: '',
})

const containerProps = computed(() => {
  const { class: className } = props
  return {
    class: cn('flex items-center h-10 w-full overflow-hidden rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2', className)
  }
})

const inputProps = computed(() => {
  const { as, type, placeholder, inputClass } = props
  return {
    as,
    type,
    placeholder,
    class: cn('h-full w-full first:pl-3 last:pr-3 py-2 bg-transparent  file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', inputClass)
  }
})
</script>

<template>
  <div v-bind="containerProps">
    <slot name="leading" />
    <Primitive
      v-model="model"
      v-bind="inputProps"
    />
    <slot name="trailing" />
  </div>
</template>
