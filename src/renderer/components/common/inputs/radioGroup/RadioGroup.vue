<script setup lang="ts" generic="TValue">
import type { MaybeReadonly } from '@renderer/lib/utils'
import RadioGroupItem from '@renderer/components/common/inputs/radioGroup/RadioGroupItem.vue'

const model = defineModel<TValue>()

withDefaults(
  defineProps<{
    options: MaybeReadonly<Array<TValue>>
    displayValue?: (option: TValue) => string
  }>(),
  {
    displayValue: (value: TValue) => String(value),
  },
)
</script>

<template>
  <div role="radiogroup" class="flex flex-col gap-2">
    <template v-for="option in options">
      <RadioGroupItem
        @click.prevent="model = option"
        :active="model === option"
        :label="displayValue(option)"
      />
    </template>
  </div>
</template>
