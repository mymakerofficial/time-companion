<script setup lang="ts">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ThemeSelector from "@/components/settings/appearance/ThemeSelector.vue";
import LocaleSelector from "@/components/settings/appearance/LocaleSelector.vue";
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.appearance.title')"
      :description="$t('settings.appearance.description')"
    />
    <SettingsSection
      :title="$t('settings.appearance.sections.theme.title')"
      :description="$t('settings.appearance.sections.theme.description')"
    >
      <ThemeSelector />
    </SettingsSection>
    <SettingsSection
      :title="$t('settings.appearance.sections.language.title')"
      :description="$t('settings.appearance.sections.language.description')"
    >
      <LocaleSelector />
    </SettingsSection>
  </div>
</template>