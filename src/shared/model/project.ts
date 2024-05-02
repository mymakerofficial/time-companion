import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'
import { defineTable } from '@shared/database/schema/defineTable'

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
  id: { type: 'string', isPrimaryKey: true },
  displayName: { type: 'string' },
  color: { type: 'string', isNullable: true },
  isBillable: { type: 'boolean' },
  createdAt: { type: 'string' },
  modifiedAt: { type: 'string', isNullable: true },
  deletedAt: { type: 'string', isNullable: true },
})
