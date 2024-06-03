<script setup lang="ts">
import SettingsHeader from '@renderer/components/settings/layout/SettingsHeader.vue'
import ProjectsTable from '@renderer/components/settings/projects/table/ProjectsTable.vue'
import { Button } from '@renderer/components/ui/button'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import NewProjectDialog from '@renderer/components/settings/projects/projectDialog/NewProjectDialog.vue'
import { useDialogStore } from '@renderer/stores/dialogStore'
import { Plus } from 'lucide-vue-next'
import { h } from 'vue'

const dialogStore = useDialogStore()

function openNewProjectDialog() {
  dialogStore.openDialog(h(NewProjectDialog))
}
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader
      :title="$t('settings.projects.title')"
      :description="$t('settings.projects.description')"
    />
    <TableActions>
      <Button @click="openNewProjectDialog" size="sm" class="gap-2">
        <Plus class="size-4" />
        <span>{{ $t('settings.projects.controls.createProject') }}</span>
      </Button>
    </TableActions>
    <ProjectsTable />
  </div>
</template>
