<script setup lang="tsx">
import {useProjectsStore} from "@/stores/projectsStore";
import SettingsHeader from "@/components/settings/layout/SettingsHeader.vue";
import ProjectsTable from "@/components/settings/projects/table/ProjectsTable.vue";
import {Button} from "@/components/ui/button";
import TableActions from "@/components/common/table/TableActions.vue";
import NewProjectDialog from "@/components/settings/projects/projectDialog/NewProjectDialog.vue";
import NewActivityDialog from "@/components/settings/projects/activityDialog/NewActivityDialog.vue";
import {useDialogStore} from "@/stores/dialogStore";
import {PlusCircle} from "lucide-vue-next"

const projectsStore = useProjectsStore()
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
    <SettingsHeader title="Projects" description="Manage your projects and activities" />
    <TableActions>
      <Button @click="openNewActivityDialog" variant="outline" size="sm" class="gap-2"><PlusCircle class="size-4" />Add Activity</Button>
      <Button @click="openNewProjectDialog" size="sm" class="gap-2"><PlusCircle class="size-4" />Add Project</Button>
    </TableActions>
    <ProjectsTable :projects="projectsStore.projects" />
  </div>
</template>