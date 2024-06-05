import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import type { Entity } from '@shared/model/helpers/entity'
import { z } from 'zod'
import { randomTailwindColor } from '@renderer/lib/colorUtils'

export type TaskDto = {
  displayName: string
  color: Nullable<string>
}

export type TaskEntityDto = TaskDto & Entity

export const tasksTable = defineTable<TaskEntityDto>('tasks', {
  id: c.uuid().primaryKey(),
  displayName: c.string().indexed(),
  color: c.string().nullable(),
  createdAt: c.string(),
  modifiedAt: c.string().nullable(),
  deletedAt: c.string().nullable(),
})
