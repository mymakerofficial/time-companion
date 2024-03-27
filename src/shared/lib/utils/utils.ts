import type { ValueOrGetter } from '@shared/lib/utils/types'
import { isFunction } from '@shared/lib/utils/checks'

export function toValue<T>(valueOrGetter: ValueOrGetter<T>): T {
  return isFunction(valueOrGetter) ? valueOrGetter() : valueOrGetter
}
