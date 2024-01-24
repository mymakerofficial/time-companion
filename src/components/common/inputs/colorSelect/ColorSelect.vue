<script setup lang="tsx">
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {buttonVariants} from "@/components/ui/button";
import {useI18n} from "vue-i18n";
import {colors} from "@/lib/colorUtils";

const model = defineModel<Nullable<string>>({ required: true, default: null })

defineProps<{
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>()

const { t } = useI18n()

const options: ComboboxOption[] = [
  {
    value: null,
    label: t('common.colors.noColor'),
  },
  ...colors.map(color => ({
    value: color,
    label: t(`common.colors.${color}`),
  })),
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