<script setup lang="tsx">
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";
import {buttonVariants} from "@/components/ui/button";
import {colors} from "@/lib/colorUtils";
import {firstOf} from "@/lib/listUtils";

const model = defineModel<Nullable<string>>({ required: true, default: null })

defineProps<{
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
}>()
</script>

<template>
  <Combobox
    v-model="model"
    :options="[null, ...colors]"
    :display-value="(color) => $t(`common.colors.${color ?? 'noColor'}`)"
    :variant="variant"
  >
    <template v-if="$slots.anchor" #anchor="{ value, toggleOpen }">
      <slot name="anchor" :value="firstOf(value)" :toggle-open="toggleOpen" />
    </template>
    <template v-else #triggerLeading="{ value }">
      <div v-provide-color="firstOf(value)" class="mr-2 size-2 rounded-full bg-color"/>
    </template>
    <template #optionLeading="{ value }">
      <div v-provide-color="value" class="mr-2 size-2 rounded-full bg-color"/>
    </template>
  </Combobox>
</template>