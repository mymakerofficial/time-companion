<script setup lang="ts">
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import {Switch} from "@/components/ui/switch";
import {useSettingsStore} from "@/stores/settingsStore";

const settings = useSettingsStore()
const autoStartActiveEventWhenTyping = settings.getValue('autoStartActiveEventWhenTyping')
</script>

<template>
  <SettingsSection
    :title="$t('settings.general.sections.autoStartActiveEventWhenTyping.title')"
    :description="$t('settings.general.sections.autoStartActiveEventWhenTyping.description')"
    is-new
    v-slot:action
  >
    <Switch v-model:checked="autoStartActiveEventWhenTyping" />
  </SettingsSection>
</template>