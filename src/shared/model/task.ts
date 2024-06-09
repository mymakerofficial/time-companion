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
  displayName: c.text().indexed(),
  color: c.text().nullable(),
  createdAt: c.text(),
  modifiedAt: c.text().nullable(),
  deletedAt: c.text().nullable(),
})

export const taskSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
})
