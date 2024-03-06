<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import NormalWorkingDurationSelector from "@/components/settings/general/NormalWorkingDurationSelector.vue";
import NormalBreakDurationSelector from "@/components/settings/general/NormalBreakDurationSelector.vue";
import BreakProjectSelector from "@/components/settings/general/BreakProjectSelector.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.general.title')"
      :description="$t('settings.general.description')"
    />
    <SettingsSection
      :title="$t('settings.general.sections.normalWorkingDuration.title')"
      :description="$t('settings.general.sections.normalWorkingDuration.description')"
    >
      <NormalWorkingDurationSelector />
    </SettingsSection>
    <SettingsSection
        :title="$t('settings.general.sections.breakProject.title')"
        :description="$t('settings.general.sections.breakProject.description')"
    >
      <BreakProjectSelector />
    </SettingsSection>
    <SettingsSection
      :title="$t('settings.general.sections.normalBreakDuration.title')"
      :description="$t('settings.general.sections.normalBreakDuration.description')"
    >
      <NormalBreakDurationSelector />
    </SettingsSection>
  </div>
</template>