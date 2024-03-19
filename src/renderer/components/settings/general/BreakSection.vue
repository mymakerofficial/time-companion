<script setup lang="ts">
import BreakProjectSelector from '@renderer/components/settings/general/BreakProjectSelector.vue'
import NormalBreakDurationSelector from '@renderer/components/settings/general/NormalBreakDurationSelector.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import SettingsSubsection from '@renderer/components/settings/layout/SettingsSubsection.vue'
</script>

<template>
  <SettingsSection
    :title="$t('settings.general.sections.break.title')"
    :description="$t('settings.general.sections.break.description')"
  >
    <SettingsSubsection
      :title="$t('settings.general.sections.break.sections.breakTime')"
    >
      <NormalBreakDurationSelector />
    </SettingsSubsection>
    <SettingsSubsection
      :title="$t('settings.general.sections.break.sections.breakProject')"
    >
      <BreakProjectSelector />
    </SettingsSubsection>
  </SettingsSection>
</template>
