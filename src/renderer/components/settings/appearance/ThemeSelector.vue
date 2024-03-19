<script setup lang="ts">
import { useThemeService } from '@renderer/services/themeService'
import RadioGroup from '@renderer/components/common/inputs/radioGroup/RadioGroup.vue'

const themeService = useThemeService()
</script>

<template>
  <RadioGroup
    v-model="themeService.theme"
    :options="themeService.availableThemes"
    :display-value="(theme) => $t(`common.themes.${theme}`)"
  />
</template>
