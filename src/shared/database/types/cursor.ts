import type { Nullable } from '@shared/lib/utils/types'

export interface DatabaseCursor<TRow extends object> {
  readonly value: Nullable<TRow>
  /***
   * Replace the current row with the provided data.
   */
  update(data: TRow): Promise<void>
  delete(): Promise<void>
  continue(): Promise<void>
  close(): void
}

export type DatabaseCursorWithValue<TRow extends object> = Omit<
  DatabaseCursor<TRow>,
  'continue' | 'value'
> & {
  readonly value: TRow
}

export type DatabaseIterator<TRow extends object> = AsyncGenerator<
  DatabaseCursorWithValue<TRow>
>
