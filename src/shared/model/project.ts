import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'

export interface ProjectDto {
  displayName: string
  color: string
  isBillable: boolean
}

export interface ProjectEntityDto
  extends ProjectDto,
    HasId,
    HasCreatedAt,
    HasModifiedAt,
    HasDeletedAt {}
