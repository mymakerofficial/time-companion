<script setup lang="tsx">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import ProjectsTable from '@renderer/components/settings/projects/table/ProjectsTable.vue'
import { Button } from '@renderer/components/ui/button'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import NewProjectDialog from '@renderer/components/settings/projects/projectDialog/NewProjectDialog.vue'
import NewActivityDialog from '@renderer/components/settings/projects/activityDialog/NewActivityDialog.vue'
import { useDialogStore } from '@renderer/stores/dialogStore'
import { PlusCircle } from 'lucide-vue-next'
import { useProjectsService } from '@renderer/services/projectsService'

const projectsService = useProjectsService()
const dialogStore = useDialogStore()

function openNewProjectDialog() {
  dialogStore.openDialog(<NewProjectDialog />)
}

function openNewActivityDialog() {
  dialogStore.openDialog(<NewActivityDialog />)
}
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.projects.title')"
      :description="$t('settings.projects.description')"
    />
    <TableActions>
      <Button
        @click="openNewActivityDialog"
        variant="secondary"
        size="sm"
        class="gap-2"
      >
        <PlusCircle class="size-4" />
        <span>{{ $t('settings.projects.controls.createActivity') }}</span>
      </Button>
      <Button @click="openNewProjectDialog" size="sm" class="gap-2">
        <PlusCircle class="size-4" />
        <span>{{ $t('settings.projects.controls.createProject') }}</span>
      </Button>
    </TableActions>
    <ProjectsTable :projects="projectsService.projects" />
  </div>
</template>
