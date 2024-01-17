<script setup lang="tsx">
import {useProjectsStore} from "@/stores/projects-store";
import SettingsHeader from "@/components/SettingsHeader.vue";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  useVueTable,
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
} from "@tanstack/vue-table";
import {computed} from "vue";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, PlusCircle} from "lucide-vue-next";
import {getColorStyleVariables} from "@/directives/v-provide-color";
import {fromNow} from "@/lib/time-utils";
import {CheckCircle2, Circle} from "lucide-vue-next";
import {isNotNull, type Nullable} from "@/lib/utils";
import {isNotEmpty} from "@/lib/list-utils";

const projectsStore = useProjectsStore()
projectsStore.init()

interface ProjectRow {
  id: string
  name: string
  billable: Nullable<boolean>
  color: string
  lastUsed: string
}

const data = computed(() => projectsStore.projects.map((project) => ({
  id: project.id,
  name: project.displayName,
  billable: true,
  color: project.color,
  lastUsed: fromNow(project.lastUsed),
})) as ProjectRow[])

const columnHelper = createColumnHelper<ProjectRow>()
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('color', {
    header: 'Color',
    cell: (props) => <div style={getColorStyleVariables(props.getValue())} class="size-3 rounded-full bg-primary" />,
  }),
  columnHelper.accessor('billable', {
    header: 'Billable',
    cell: (props) => isNotNull(props.getValue()) ? props.getValue() ? <CheckCircle2 class="size-5" /> : <Circle class="size-5" /> : null, // i dont like ternary operators
  }),
  columnHelper.accessor('lastUsed', {
    header: 'Last Used',
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => <Button variant="ghost" size="icon"><MoreHorizontal /></Button>,
  })
]

const table = useVueTable({
  data: data.value,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="py-16 px-8">
    <SettingsHeader title="Projects" description="Manage your projects and activities" />
    <div class="space-y-4">
      <div class="flex gap-4 justify-end">
        <Button size="sm" class="flex items-center gap-1.5"><PlusCircle class="size-4" />New Project</Button>
      </div>
      <div class="rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="isNotEmpty(table.getRowModel().rows)">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() && 'selected'"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell
                :colspan="columns.length"
                class="h-24 text-center text-muted-foreground italic"
              >
                *crickets*
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>