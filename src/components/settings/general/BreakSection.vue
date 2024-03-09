<script setup lang="ts">
import BreakProjectSelector from "@/components/settings/general/BreakProjectSelector.vue";
import NormalBreakDurationSelector from "@/components/settings/general/NormalBreakDurationSelector.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import SettingsSubsection from "@/components/settings/layout/SettingsSubsection.vue";
</script>

<template>
  <SettingsSection
      :title="$t('settings.general.sections.break.title')"
      :description="$t('settings.general.sections.break.description')"
  >
    <SettingsSubsection :title="$t('settings.general.sections.break.sections.breakTime')">
      <NormalBreakDurationSelector />
    </SettingsSubsection>
    <SettingsSubsection :title="$t('settings.general.sections.break.sections.breakProject')">
      <BreakProjectSelector />
    </SettingsSubsection>
  </SettingsSection>
</template>