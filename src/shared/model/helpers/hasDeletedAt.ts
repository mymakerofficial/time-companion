import type { Nullable } from '@shared/lib/utils/types'
import { Temporal } from 'temporal-polyfill'

export type HasDeletedAt<T = Temporal.PlainDateTime> = {
  deletedAt: Nullable<T>
}
