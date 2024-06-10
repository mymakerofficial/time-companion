import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export type HasCreatedAt<T = PlainDateTime> = {
  createdAt: T
}
