<script setup lang="tsx">
import {colorNames} from "@/components/common/inputs/colorSelect/constants";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {optionsFromRecord} from "@/helpers/combobox/comboboxHelpers";
import {buttonVariants} from "@/components/ui/button";

const model = defineModel<Nullable<string>>({ required: true, default: null })

defineProps<{
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>()

const options: ComboboxOption[] = [{
    value: null,
    label: 'None',
  },
  ...optionsFromRecord(colorNames),
]
</script>

<template>
  <Combobox v-model="model" :options="options" :variant="variant">
    <template #triggerLeading="{ value }">
      <div v-provide-color="value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
    <template #optionLeading="{ value }">
      <div v-provide-color="value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
  </Combobox>
</template>