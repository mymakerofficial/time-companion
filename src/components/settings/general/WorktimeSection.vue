<script setup lang="ts">
import NormalWorkingDurationSelector from "@/components/settings/general/NormalWorkingDurationSelector.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
</script>

<template>
  <SettingsSection
    :title="$t('settings.general.sections.normalWorkingDuration.title')"
    :description="$t('settings.general.sections.normalWorkingDuration.description')"
  >
    <NormalWorkingDurationSelector />
  </SettingsSection>
</template>