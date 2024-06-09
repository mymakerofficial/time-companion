import { createColumnHelper } from '@tanstack/vue-table'
import type { ProjectDto } from '@shared/model/project'
import { Button } from '@renderer/components/ui/button'
import { Pencil } from 'lucide-vue-next'

const columnHelper = createColumnHelper<ProjectDto>()

export function createProjectColumns(onEdit: (row: ProjectDto) => void) {
  return [
    columnHelper.accessor('id', {
      header: () => 'id',
    }),
    columnHelper.accessor('displayName', {
      header: () => 'displayName',
    }),
    columnHelper.accessor('color', {
      header: () => 'color',
    }),
    columnHelper.accessor('isBillable', {
      header: () => 'isBillable',
    }),
    columnHelper.accessor('isBreak', {
      header: () => 'isBreak',
    }),
    columnHelper.accessor('createdAt', {
      header: () => 'createdAt',
    }),
    columnHelper.accessor('modifiedAt', {
      header: () => 'modifiedAt',
    }),
    columnHelper.accessor('deletedAt', {
      header: () => 'deletedAt',
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <Button
          onClick={() => onEdit(row.original)}
          variant='ghost'
          size='icon'
        >
          <Pencil class='size-4' />
        </Button>
      ),
      meta: {
        className: 'w-0',
      },
    }),
  ]
}
