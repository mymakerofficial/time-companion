<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import BreakSection from '@renderer/components/settings/general/BreakSection.vue'
import WorktimeSection from '@renderer/components/settings/general/WorktimeSection.vue'
import ActiveEventInputSection from '@renderer/components/settings/general/ActiveEventInputSection.vue'
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.general.title')"
      :description="$t('settings.general.description')"
    />
    <WorktimeSection />
    <BreakSection />
    <ActiveEventInputSection />
  </div>
</template>
