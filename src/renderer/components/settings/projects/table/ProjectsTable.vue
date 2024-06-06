<script setup lang="ts">
import { h } from 'vue'
import Table from '@renderer/components/common/table/Table.vue'
import EditProjectDialog from '@renderer/components/settings/projects/dialog/EditProjectDialog.vue'
import { useDialogStore } from '@renderer/stores/dialogStore'
import { useGetProjects } from '@renderer/composables/queries/projects/useGetProjects'
import { usePatchProjectById } from '@renderer/composables/mutations/projects/usePatchProjectById'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-vue-next'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import NewProjectDialog from '@renderer/components/settings/projects/dialog/NewProjectDialog.vue'
import { createProjectColumns } from '@renderer/components/settings/projects/table/projectColumns'

const { data: projects } = useGetProjects()
const { mutate: patchProject } = usePatchProjectById()

const dialogStore = useDialogStore()

function openNewProjectDialog() {
  dialogStore.openDialog(h(NewProjectDialog))
}

const columns = createProjectColumns({
  updateData: (original, columnAccessor, value) => {
    patchProject({
      id: original.id,
      project: { [columnAccessor]: value },
    })
  },
  onEdit: (id) => {
    dialogStore.openDialog(h(EditProjectDialog, { id }))
  },
})
</script>

<template>
  <TableActions>
    <Button @click="openNewProjectDialog" size="sm" class="gap-2">
      <Plus class="size-4" />
      <span>{{ $t('settings.projects.controls.createProject') }}</span>
    </Button>
  </TableActions>
  <Table :data="projects" :columns="columns" />
</template>
