import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { c } from '@shared/database/schema/columnBuilder'
import { z } from 'zod'

export type ProjectDto = {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
}

type ProjectEntityBase = HasId & HasCreatedAt & HasModifiedAt & HasDeletedAt

export type ProjectEntityDto = ProjectDto & ProjectEntityBase

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
  displayName: z.string(),
  color: z.string().nullable(),
  isBillable: z.boolean(),
  isBreak: z.boolean(),
})
