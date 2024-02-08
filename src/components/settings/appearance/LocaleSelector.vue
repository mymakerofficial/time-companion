<script setup lang="ts">
import {useLocaleStore} from "@/stores/settings/localeStore";
import Combobox from "@/components/common/inputs/combobox/Combobox.vue";

const localeStore = useLocaleStore()
</script>

<template>
  <Combobox
    v-model="localeStore.locale"
    :options="localeStore.availableLocales"
    :display-value="(value) => $t(`common.locales.${value}`)"
  />
</template>