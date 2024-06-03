import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'

export type TaskDto = {
  projectId: string
  displayName: string
  color: Nullable<string>
}

type TaskEntityBase = HasId & HasCreatedAt & HasModifiedAt & HasDeletedAt

export type TaskEntityDto = TaskDto & TaskEntityBase

export const tasksTable = defineTable<TaskEntityDto>('tasks', {
  id: c.uuid().primaryKey(),
  projectId: c.uuid(),
  displayName: c.string().indexed(),
  color: c.string().nullable(),
  createdAt: c.string(),
  modifiedAt: c.string().nullable(),
  deletedAt: c.string().nullable(),
})
