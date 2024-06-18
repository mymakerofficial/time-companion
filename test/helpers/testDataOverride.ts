import type { MaybeArray } from '@shared/lib/utils/types'
import { entriesOf, objectFromEntries } from '@shared/lib/utils/object'
import { isArray } from '@shared/lib/utils/checks'

export type TestDataOverride<T> = {
  [K in keyof T]: MaybeArray<T[K]>
}

export function getOverrideAtIndex<T>(
  override: Partial<TestDataOverride<T>>,
  index: number,
) {
  return objectFromEntries(
    entriesOf(override).map(([key, value]) => [
      key,
      (isArray(value) ? value[index % value.length] : value) as T[keyof T],
    ]),
  )
}
