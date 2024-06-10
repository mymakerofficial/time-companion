import { Temporal } from 'temporal-polyfill'

export type HasCreatedAt<T = Temporal.PlainDateTime> = {
  createdAt: T
}
