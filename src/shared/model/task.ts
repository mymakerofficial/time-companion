import type { Nullable } from '@shared/lib/utils/types'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { z } from 'zod'
import { randomTailwindColor } from '@renderer/lib/colorUtils'
import { tasks } from '@shared/drizzle/schema'

export type TaskBase = {
  displayName: string
  color: Nullable<string>
}

export type CreateTask = TaskBase

export type UpdateTask = TaskBase

export type TaskDto = CreateTask & BaseDto

export const tasksTable = tasks

export type TaskEntity = typeof tasksTable.$inferSelect

export const taskSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
})
