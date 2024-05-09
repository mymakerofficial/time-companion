import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'
import { t } from '@shared/database/schema/columnBuilder'

export type ProjectDto = {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
}

type ProjectEntityBase = HasId & HasCreatedAt & HasModifiedAt & HasDeletedAt

export type ProjectEntityDto = ProjectDto & ProjectEntityBase

export type ProjectEntityDao = ProjectDto & {
  readonly [K in keyof ProjectEntityBase]: Nullable<ProjectEntityBase[K]>
}

export const projectsTable = defineTable<ProjectEntityDto>('projects', {
  id: t.string().primaryKey(),
  displayName: t.string(),
  color: t.string().nullable(),
  isBillable: t.boolean(),
  createdAt: t.string(),
  modifiedAt: t.string().nullable(),
  deletedAt: t.string().nullable(),
})
