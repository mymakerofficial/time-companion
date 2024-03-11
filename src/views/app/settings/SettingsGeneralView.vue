<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import BreakSection from "@/components/settings/general/BreakSection.vue";
import WorktimeSection from "@/components/settings/general/WorktimeSection.vue";
import ActiveEventInputSection from "@/components/settings/general/ActiveEventInputSection.vue";
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