import type { HasId } from '@shared/model/helpers/hasId'
import type { HasCreatedAt } from '@shared/model/helpers/hasCreatedAt'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'
import type { HasDeletedAt } from '@shared/model/helpers/hasDeletedAt'
import type { Nullable } from '@shared/lib/utils/types'

export interface TaskDto {
  projectId: string
  displayName: string
  color: Nullable<string>
}

export interface TaskEntityDto
  extends TaskDto,
    HasId,
    HasCreatedAt,
    HasModifiedAt,
    HasDeletedAt {}
