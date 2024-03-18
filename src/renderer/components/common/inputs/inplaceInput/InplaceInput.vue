<script setup lang="ts">
import AutoGrowInput from "@renderer/components/common/inputs/AutoGrowInput.vue";
import {isEmpty} from "@renderer/lib/listUtils";
import {ref, watch} from "vue";

const model = defineModel<string>({ required: true })

const inputValue = ref(model.value)

watch(model, (newValue) => {
  inputValue.value = newValue
})

async function handleChange(newValue: string) {
  if (isEmpty(newValue)) {
    inputValue.value = model.value
    return
  }

  model.value = newValue
}
</script>

<template>
  <AutoGrowInput v-model="inputValue" @change="handleChange" class="focus-visible:outline-none" />
</template>