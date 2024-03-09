<script setup lang="ts">
import {useLocaleService} from "@/services/localeService";
import RadioGroup from "@/components/common/inputs/radioGroup/RadioGroup.vue";

const localeService = useLocaleService()
</script>

<template>
  <RadioGroup
    v-model="localeService.locale"
    :options="localeService.availableLocales"
    :display-value="(locale) => $t(`common.locales.${locale}`)"
  />
</template>