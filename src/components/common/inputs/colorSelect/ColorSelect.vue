<script setup lang="tsx">
import {colorNames} from "@/components/common/inputs/colorSelect/constants";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import type {Nullable} from "@/lib/utils";
import {vProvideColor} from "@/directives/vProvideColor";

const model = defineModel<Nullable<string>>({ required: true, default: null })

const options = [{
    value: null,
    label: 'None',
  },
  ...Object.entries(colorNames).map(([value, label]) => ({
    value,
    label,
  }))
];
</script>

<template>
  <Combobox v-model="model" :options="options">
    <template #triggerLeading="{ value }">
      <div v-provide-color="value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
    <template #optionLeading="{ value }">
      <div v-provide-color="value" class="mr-2 size-2 rounded-full bg-primary"/>
    </template>
  </Combobox>
</template>