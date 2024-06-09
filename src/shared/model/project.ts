import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import { z } from 'zod'
import type { BaseDto } from '@shared/model/helpers/baseDto'
import { randomTailwindColor } from '@renderer/lib/colorUtils'
import type { InferTable } from '@shared/database/types/schema'

export type ProjectBase = {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
}

export type CreateProject = ProjectBase

export type UpdateProject = ProjectBase

export type ProjectDto = ProjectBase & BaseDto

export const projectsTable = defineTable('projects', {
  id: c.uuid().primaryKey(),
  displayName: c.text().indexed().unique(),
  color: c.text().nullable(),
  isBillable: c.boolean(),
  isBreak: c.boolean(),
  createdAt: c.datetime(),
  modifiedAt: c.datetime().nullable(),
  deletedAt: c.datetime().nullable(),
})

export type ProjectEntity = InferTable<typeof projectsTable>

export const projectSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
  isBillable: z.boolean().default(true),
  isBreak: z.boolean().default(false),
})
