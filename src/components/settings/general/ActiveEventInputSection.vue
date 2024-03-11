<script setup lang="ts">
import SettingsSection from "@/components/settings/layout/SettingsSection.vue";
import {Switch} from "@/components/ui/switch";
import {useSettingsStore} from "@/stores/settingsStore";
import DurationInput from "@/components/common/inputs/timeInput/DurationInput.vue";
import {formatDurationIso, parseDuration} from "@/lib/neoTime";
import {Clock} from "lucide-vue-next";

const settings = useSettingsStore()
const autoStartActiveEventWhenTyping = settings.getValue('autoStartActiveEventWhenTyping')
const minimumDuration = settings.getValue('minimumEventDuration', {
  get: parseDuration,
  set: formatDurationIso,
})
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
  <SettingsSection
    :title="$t('settings.general.sections.minimumEventDuration.title')"
    :description="$t('settings.general.sections.minimumEventDuration.description')"
    is-new
  >
    <DurationInput
      v-model="minimumDuration"
      allow-seconds
      v-slot:leading
    >
      <Clock class="mx-3 size-4 text-muted-foreground" />
    </DurationInput>
  </SettingsSection>
</template>