<script setup lang="tsx">
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ProjectsTable from "@/components/settings/projects/table/ProjectsTable.vue";
import {Button} from "@/components/ui/button";
import TableActions from "@/components/common/table/TableActions.vue";
import NewProjectDialog from "@/components/settings/projects/projectDialog/NewProjectDialog.vue";
import NewActivityDialog from "@/components/settings/projects/activityDialog/NewActivityDialog.vue";
import {useDialogStore} from "@/stores/dialogStore";
import {PlusCircle} from "lucide-vue-next"
import {useProjectsService} from "@/services/projectsService";

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
      <Button @click="openNewActivityDialog" variant="secondary" size="sm" class="gap-2">
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