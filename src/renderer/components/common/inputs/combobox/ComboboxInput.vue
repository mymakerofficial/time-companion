<script setup lang="ts">
import {ComboboxInput} from "radix-vue";
import type {ComboboxInputProps} from "radix-vue";
import {computed, onMounted, ref} from "vue";

const model = defineModel({ required: false })

const props = defineProps<ComboboxInputProps>()

const disabled = ref(!props.autoFocus)

onMounted(() => {
  setTimeout(() => {
    disabled.value = false
  }, 2)
})

const delegatedProps = computed(() => {
  return {
    ...props,
    disabled: disabled.value || props.disabled,
  }
})
</script>

<template>
  <ComboboxInput
    v-model="model"
    v-bind="delegatedProps"
  />
</template>