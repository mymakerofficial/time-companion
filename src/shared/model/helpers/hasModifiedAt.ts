import type { Nullable } from '@shared/lib/utils/types'
import { Temporal } from 'temporal-polyfill'

export type HasModifiedAt<T = Temporal.PlainDateTime> = {
  modifiedAt: Nullable<T>
}
