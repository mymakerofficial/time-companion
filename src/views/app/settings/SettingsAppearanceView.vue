<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ThemeSelector from "@/components/settings/appearance/ThemeSelector.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Appearance" description="Customize the look and feel of the app" />
    <ThemeSelector />
  </div>
</template>