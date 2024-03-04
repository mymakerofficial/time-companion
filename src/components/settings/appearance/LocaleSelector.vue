<script setup lang="ts">
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";
import {useLocaleService} from "@/services/localeService";

const localeService = useLocaleService()
</script>

<template>
  <Combobox
    v-model="localeService.locale"
    :options="localeService.availableLocales"
    :display-value="(value) => $t(`common.locales.${value}`)"
  />
</template>