<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import NormalWorkingDurationSelector from "@/components/settings/general/NormalWorkingDurationSelector.vue";
import NormalBreakDurationSelector from "@/components/settings/general/NormalBreakDurationSelector.vue";
import BreakProjectSelector from "@/components/settings/general/BreakProjectSelector.vue";
import BreakSection from "@/components/settings/general/BreakSection.vue";
import WorktimeSection from "@/components/settings/general/WorktimeSection.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.general.title')"
      :description="$t('settings.general.description')"
    />
    <WorktimeSection />
    <BreakSection />
  </div>
</template>