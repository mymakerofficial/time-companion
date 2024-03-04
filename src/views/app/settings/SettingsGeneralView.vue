<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import WorkingHoursSelector from "@/components/settings/general/WorkingHoursSelector.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.general.title')"
      :description="$t('settings.general.description')"
    />
    <SettingsSection
      :title="$t('settings.general.sections.workingHours.title')"
      :description="$t('settings.general.sections.workingHours.description')"
    >
      <WorkingHoursSelector />
    </SettingsSection>
  </div>
</template>