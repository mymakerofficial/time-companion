<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import RunningTimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/RunningTimeEntryInput.vue'
import { useToday } from '@renderer/composables/useNow'
import PlaygroundTimeEntriesList from '@renderer/components/playground/PlaygroundTimeEntriesList.vue'
import PlaygroundDayInfo from '@renderer/components/playground/PlaygroundDayInfo.vue'
import { useGetOrCreateDayByDate } from '@renderer/composables/queries/days/useGetOrCreateDayByDate'
import ProjectsTable from '@renderer/components/settings/projects/table/ProjectsTable.vue'

const today = useToday()
const { data: day } = useGetOrCreateDayByDate(today)
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <SettingsSection v-if="day">
      <RunningTimeEntryInput :day-id="day.id" />
    </SettingsSection>
    <SettingsSection v-if="day">
      <PlaygroundDayInfo :day-id="day.id" />
      <PlaygroundTimeEntriesList :day-id="day.id" />
    </SettingsSection>
    <SettingsSection>
      <ProjectsTable />
    </SettingsSection>
  </ResponsiveContainer>
</template>
