<script setup lang="ts">
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import { Switch } from '@renderer/components/ui/switch'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import DurationInput from '@renderer/components/common/inputs/timeInput/DurationInput.vue'
import { formatDurationIso, parseDuration } from '@renderer/lib/neoTime'
import { Clock } from 'lucide-vue-next'

const settings = useSettingsStore()
const autoStartActiveEventWhenTyping = settings.getValue(
  'autoStartActiveEventWhenTyping',
)
const stopActiveEventWithBackspace = settings.getValue(
  'stopActiveEventWithBackspace',
)
const minimumDuration = settings.getValue('minimumEventDuration', {
  get: parseDuration,
  set: formatDurationIso,
})
</script>

<template>
  <SettingsSection
    :title="
      $t('settings.general.sections.autoStartActiveEventWhenTyping.title')
    "
    :description="
      $t('settings.general.sections.autoStartActiveEventWhenTyping.description')
    "
    v-slot:action
  >
    <Switch v-model:checked="autoStartActiveEventWhenTyping" />
  </SettingsSection>
  <SettingsSection
    :title="$t('settings.general.sections.stopActiveEventWithBackspace.title')"
    :description="
      $t('settings.general.sections.stopActiveEventWithBackspace.description')
    "
    v-slot:action
  >
    <Switch v-model:checked="stopActiveEventWithBackspace" />
  </SettingsSection>
  <SettingsSection
    :title="$t('settings.general.sections.minimumEventDuration.title')"
    :description="
      $t('settings.general.sections.minimumEventDuration.description')
    "
  >
    <DurationInput v-model="minimumDuration" allow-seconds v-slot:leading>
      <Clock class="mx-3 size-4 text-muted-foreground" />
    </DurationInput>
  </SettingsSection>
</template>
