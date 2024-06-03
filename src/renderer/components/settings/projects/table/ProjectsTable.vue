<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { ProjectRow } from '@renderer/components/settings/projects/table/types'
import { createProjectsColumns } from '@renderer/components/settings/projects/table/projectsColumns'
import Table from '@renderer/components/common/table/Table.vue'
import type {
  ExpandedState,
  SortingState,
  TableOptions,
} from '@tanstack/vue-table'
import { getExpandedRowModel, getSortedRowModel } from '@tanstack/vue-table'
import EditProjectDialog from '@renderer/components/settings/projects/projectDialog/EditProjectDialog.vue'
import EditActivityDialog from '@renderer/components/settings/projects/activityDialog/EditActivityDialog.vue'
import { useDialogStore } from '@renderer/stores/dialogStore'
import { toProjectRow } from '@renderer/components/settings/projects/table/helpers'
import { updater } from '@renderer/lib/helpers/tableHelpers'
import type { MaybeReadonly } from '@renderer/lib/utils'
import { whereId } from '@renderer/lib/listUtils'

const props = defineProps<{
  projects: MaybeReadonly<Array<ReactiveProject>>
}>()

const dialogStore = useDialogStore()

const projectsColumns = createProjectsColumns({
  updateData: (original, columnAccessor, value) => {
    const projectId = original.parentProjectId ?? original.id
    const projectIndex = props.projects.findIndex(whereId(projectId))

    if (original.isProject) {
      // @ts-ignore types are not the same but compatible in this case
      props.projects[projectIndex][columnAccessor] = value
    } else {
      const activityIndex = props.projects[
        projectIndex
      ].childActivities.findIndex(whereId(original.id))
      props.projects[projectIndex].childActivities[activityIndex][
          // prettier-ignore
          // @ts-ignore types are not the same but compatible in this case
          columnAccessor
      ] =
        value
    }
  },
  onOpenEditProjectDialog: (id) => {
    dialogStore.openDialog(h(EditProjectDialog, { id }))
  },
  onOpenEditActivityDialog: (id) => {
    dialogStore.openDialog(h(EditActivityDialog, { id }))
  },
})

const data = computed(() => props.projects.map(toProjectRow))

const sorting = ref<SortingState>([])
const expanded = ref<ExpandedState>({})

const tableOptions: Partial<TableOptions<ProjectRow>> = {
  state: {
    get sorting() {
      return sorting.value
    },
    get expanded() {
      return expanded.value
    },
  },
  onSortingChange: (updaterOrValue) => updater(updaterOrValue, sorting),
  onExpandedChange: (updaterOrValue) => updater(updaterOrValue, expanded),
  getSubRows: (row) => row.activities,
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
}
</script>

<template>
  <Table :data="data" :columns="projectsColumns" :options="tableOptions" />
</template>
