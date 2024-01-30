<script setup lang="ts">
import {useLocaleStore} from "@/stores/settings/localeStore";
import type {ComboboxOption} from "@/components/common/inputs/combobox/types";
import {useI18n} from "vue-i18n";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import {computed} from "vue";

const localeStore = useLocaleStore()
const { t } = useI18n()

const options = computed<ComboboxOption[]>(() => localeStore.availableLocales.map((value) => ({
  value,
  label: t(`common.locales.${value}`),
})))
</script>

<template>
  <Combobox v-model="localeStore.locale" :options="options" />
</template>