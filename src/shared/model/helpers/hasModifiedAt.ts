import type { Nullable } from '@shared/lib/utils/types'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export type HasModifiedAt<T = PlainDateTime> = {
  modifiedAt: Nullable<T>
}
