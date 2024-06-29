import type { Nullable } from '@shared/lib/utils/types'
import { z } from 'zod'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { randomTailwindColor } from '@renderer/lib/colorUtils'
import { projects } from '@shared/drizzle/schema'

export type ProjectBase = {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
}

export type CreateProject = ProjectBase

export type UpdateProject = ProjectBase

export type ProjectDto = ProjectBase & BaseDto

export const projectsTable = projects

export type ProjectEntity = typeof projectsTable.$inferSelect

export const projectSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
  isBillable: z.boolean().default(true),
  isBreak: z.boolean().default(false),
})
