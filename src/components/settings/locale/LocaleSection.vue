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
  <section>
    <div class="mb-8 space-y-2">
      <h3 class="text-lg tracking-tight font-medium text-foreground">{{ $t('settings.locale.sections.language.title') }}</h3>
      <p class="text-sm text-muted-foreground">{{ $t('settings.locale.sections.language.description') }}</p>
    </div>
    <Combobox v-model="localeStore.locale" :options="options" />
  </section>
</template>