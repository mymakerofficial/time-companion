import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import { z } from 'zod'
import type { Entity } from '@shared/model/helpers/entity'
import { randomTailwindColor } from '@renderer/lib/colorUtils'

export type ProjectDto = {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
}

export type ProjectEntityDto = ProjectDto & Entity

export const projectsTable = defineTable<ProjectEntityDto>('projects', {
  id: c.uuid().primaryKey(),
  displayName: c.string().indexed().unique(),
  color: c.string().nullable(),
  isBillable: c.boolean(),
  isBreak: c.boolean(),
  createdAt: c.string(),
  modifiedAt: c.string().nullable(),
  deletedAt: c.string().nullable(),
})

export const projectSchema = z.object({
  displayName: z.string().min(1),
  color: z.string().nullable().default(randomTailwindColor),
  isBillable: z.boolean().default(true),
  isBreak: z.boolean().default(false),
})
