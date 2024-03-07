<script setup lang="ts">
import {useThemeService} from "@/services/themeService";
import RadioGroup from "@/components/common/inputs/radioGroup/RadioGroup.vue";

const themeService = useThemeService()
</script>

<template>
  <RadioGroup
    v-model="themeService.theme"
    :options="themeService.availableThemes"
    :displayValue="(option) => $t(`common.themes.${option}`)"
  />
</template>
