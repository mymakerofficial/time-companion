import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { string, uuid } from '@shared/database/schema/columnBuilder'

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
  id: uuid().primaryKey(),
  projectId: uuid(),
  displayName: string().indexed(),
  color: string().nullable(),
  createdAt: string(),
  modifiedAt: string().nullable(),
  deletedAt: string().nullable(),
})
