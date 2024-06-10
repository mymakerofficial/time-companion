<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import TimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/TimeEntryInput.vue'
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <SettingsSection>
      <TimeEntryInput />
    </SettingsSection>
  </ResponsiveContainer>
</template>
