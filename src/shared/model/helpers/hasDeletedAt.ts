import type { Nullable } from '@shared/lib/utils/types'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export type HasDeletedAt<T = PlainDateTime> = {
  deletedAt: Nullable<T>
}
