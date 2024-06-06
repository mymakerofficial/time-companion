<script setup lang="ts">
import Table from '@renderer/components/common/table/Table.vue'
import EditProjectDialog from '@renderer/components/settings/projects/dialog/EditProjectDialog.vue'
import { useGetProjects } from '@renderer/composables/queries/projects/useGetProjects'
import { usePatchProjectById } from '@renderer/composables/mutations/projects/usePatchProjectById'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-vue-next'
import TableActions from '@renderer/components/common/table/TableActions.vue'
import CreateProjectDialog from '@renderer/components/settings/projects/dialog/CreateProjectDialog.vue'
import { createProjectColumns } from '@renderer/components/settings/projects/table/projectColumns'
import { useDialog } from '@renderer/composables/dialog/useDialog'

const { data: projects } = useGetProjects()
const { mutate: patchProject } = usePatchProjectById()
const { open: openCreateProject } = useDialog(CreateProjectDialog)
const { open: openEditProject } = useDialog(EditProjectDialog)

const columns = createProjectColumns({
  updateData: (original, columnAccessor, value) => {
    patchProject({
      id: original.id,
      project: { [columnAccessor]: value },
    })
  },
  onEdit: (id) => openEditProject({ id }),
})
</script>

<template>
  <TableActions>
    <Button @click="openCreateProject" size="sm" class="gap-2">
      <Plus class="size-4" />
      <span>{{ $t('settings.projects.controls.createProject') }}</span>
    </Button>
  </TableActions>
  <Table :data="projects" :columns="columns" />
</template>
