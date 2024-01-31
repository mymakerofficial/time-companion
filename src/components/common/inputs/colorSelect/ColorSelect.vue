<script setup lang="tsx">
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {buttonVariants} from "@/components/ui/button";
import {useI18n} from "vue-i18n";
import {colors} from "@/lib/colorUtils";
import {computed} from "vue";
import {firstOf} from "@/lib/listUtils";

const model = defineModel<Nullable<string>>({ required: true, default: null })
const open = defineModel<boolean>('open', { required: false, default: false })

defineProps<{
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>()

const { t } = useI18n()

const options = computed<ComboboxOption<Nullable<string>>[]>(() => [
  {
    value: null,
    label: t('common.colors.noColor'),
  },
  ...colors.map(color => ({
    value: color,
    label: t(`common.colors.${color}`),
  })),
])
</script>

<template>
  <Combobox v-model="model" :options="options" :variant="variant" v-model:open="open">
    <template v-if="$slots.trigger" #trigger="{ selected }">
      <slot name="trigger" :selected="firstOf(selected)" />
    </template>
    <template v-else #triggerLeading="{ selected }">
      <div v-provide-color="firstOf(selected)?.value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
    <template #optionLeading="{ option }">
      <div v-provide-color="option.value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
  </Combobox>
</template>