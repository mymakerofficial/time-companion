import type { Nullable } from '@shared/lib/utils/types'

export interface DatabaseCursor<TRow extends object> {
  readonly value: Nullable<TRow>
  update(data: Partial<TRow>): Promise<void>
  delete(): Promise<void>
  continue(): Promise<void>
  close(): void
}
