import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { z } from 'zod'
import { randomTailwindColor } from '@renderer/lib/colorUtils'
import type { InferTable } from '@shared/database/types/schema'

export type TaskBase = {
  displayName: string
  color: Nullable<string>
}

export type CreateTask = TaskBase

export type UpdateTask = TaskBase

export type TaskDto = CreateTask & BaseDto

export const tasksTable = defineTable('tasks', {
  id: c.uuid().primaryKey(),
  displayName: c.text().indexed(),
  color: c.text().nullable(),
  createdAt: c.datetime(),
  modifiedAt: c.datetime().nullable(),
  deletedAt: c.datetime().nullable(),
})

export type TaskEntity = InferTable<typeof tasksTable>

export const taskSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
})
