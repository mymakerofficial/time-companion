import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Maybe } from '@shared/lib/utils/types'
import { Duration } from '@shared/lib/datetime/duration'
import { isAbsent } from '@shared/lib/utils/checks'

export function useUntil(
  start: MaybeRefOrGetter<Maybe<PlainDateTime | PlainDate | PlainTime>>,
  end: MaybeRefOrGetter<Maybe<PlainDateTime | PlainDate | PlainTime>>,
) {
  return computed(() => {
    const unrefStart = toValue(start)
    const unrefEnd = toValue(end)

    if (isAbsent(unrefStart) || isAbsent(unrefEnd)) {
      return Duration.zero()
    }

    return unrefStart.until(unrefEnd)
  })
}
