<script setup lang="ts">
import { h } from 'vue'
import { createProjectsColumns } from '@renderer/components/settings/projects/table/projectsColumns'
import Table from '@renderer/components/common/table/Table.vue'
import EditProjectDialog from '@renderer/components/settings/projects/projectDialog/EditProjectDialog.vue'
import { useDialogStore } from '@renderer/stores/dialogStore'
import { useGetProjects } from '@renderer/composables/queries/useGetProjects'
import { usePatchProjectById } from '@renderer/composables/mutations/usePatchProjectById'

const { data: projects } = useGetProjects()
const { mutate: patchProject } = usePatchProjectById()

const dialogStore = useDialogStore()

const columns = createProjectsColumns({
  updateData: (original, columnAccessor, value) => {
    patchProject({
      id: original.id,
      project: { [columnAccessor]: value },
    })
  },
  onEditProject: (id) => {
    dialogStore.openDialog(h(EditProjectDialog, { id }))
  },
})
</script>

<template>
  <Table v-if="projects" :data="projects" :columns="columns" />
</template>
