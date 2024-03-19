import type { Nullable } from '@shared/lib/utils/types'

export interface EntityDto {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: Nullable<string>
}
