<script setup lang="ts">
import ResponsiveContainer from '@renderer/components/common/layout/ResponsiveContainer.vue'
import SettingsSection from '@renderer/components/settings/layout/SettingsSection.vue'
import RunningTimeEntryInput from '@renderer/components/common/inputs/timeEntryInput/RunningTimeEntryInput.vue'
import { useToday } from '@renderer/composables/useNow'
import PlaygroundTimeEntriesList from '@renderer/components/playground/PlaygroundTimeEntriesList.vue'
import PlaygroundDayInfo from '@renderer/components/playground/PlaygroundDayInfo.vue'
import { useGetOrCreateDayByDate } from '@renderer/composables/queries/days/useGetOrCreateDayByDate'
import ProjectsTable from '@renderer/components/settings/projects/table/ProjectsTable.vue'
import DatabaseExplorer from '@renderer/components/playground/database/DatabaseExplorer.vue'

const today = useToday()
const { data: day } = useGetOrCreateDayByDate(today)
</script>

<template>
  <ResponsiveContainer class="my-14 flex flex-col">
    <SettingsSection title="Database Explorer">
      <DatabaseExplorer />
    </SettingsSection>
    <SettingsSection v-if="day" title="Running Time Entry">
      <RunningTimeEntryInput :day-id="day.id" />
    </SettingsSection>
    <SettingsSection v-if="day" title="Active Day">
      <PlaygroundDayInfo :day-id="day.id" />
      <PlaygroundTimeEntriesList :day-id="day.id" />
    </SettingsSection>
    <SettingsSection title="Projects">
      <ProjectsTable />
    </SettingsSection>
  </ResponsiveContainer>
</template>
