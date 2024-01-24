<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ThemeSelector from "@/components/settings/appearance/ThemeSelector.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.appearance.title')"
      :description="$t('settings.appearance.description')"
    />
    <ThemeSelector />
  </div>
</template>