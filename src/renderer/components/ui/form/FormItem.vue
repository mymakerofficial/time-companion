<script lang="ts">
import { type InjectionKey } from 'vue'

export const FORM_ITEM_INJECTION_KEY = Symbol() as InjectionKey<string>
</script>

<script lang="ts" setup>
import { provide, useAttrs } from 'vue'
import { useId } from 'radix-vue'

defineOptions({
  inheritAttrs: false,
})

const id = useId()
provide(FORM_ITEM_INJECTION_KEY, id)

const { class: className, ...rest } = useAttrs()
</script>

<template>
  <div :class="className" v-bind="rest">
    <slot />
  </div>
</template>
