<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import LocaleSection from "@/components/settings/locale/LocaleSection.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.locale.title')"
      :description="$t('settings.locale.description')"
    />
    <LocaleSection />
  </div>
</template>