import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'

export type TaskDto = {
  projectId: string
  displayName: string
  color: Nullable<string>
}

type TaskEntityBase = HasId & HasCreatedAt & HasModifiedAt & HasDeletedAt

export type TaskEntityDto = TaskDto & TaskEntityBase

export type TaskEntityDao = Omit<TaskDto, 'projectId'> & {
  readonly projectId: Nullable<string>
} & {
  readonly [K in keyof TaskEntityBase]: Nullable<TaskEntityBase[K]>
}

export const tasksTable = defineTable<TaskEntityDto>('tasks', {
  id: { type: 'string', isPrimaryKey: true },
  projectId: { type: 'string' },
  displayName: { type: 'string' },
  color: { type: 'string', isNullable: true },
  createdAt: { type: 'string' },
  modifiedAt: { type: 'string', isNullable: true },
  deletedAt: { type: 'string', isNullable: true },
})
