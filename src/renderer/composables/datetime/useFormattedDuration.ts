import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Maybe } from '@shared/lib/utils/types'
import type { Intl } from 'temporal-polyfill'
import { humanizeDuration } from '@renderer/lib/neoTime'
import type { Duration } from '@shared/lib/datetime/duration'
import { isAbsent } from '@shared/lib/utils/checks'

export function useFormattedDuration(
  duration: MaybeRefOrGetter<Maybe<Duration>>,
  options: Intl.DateTimeFormatOptions & { fallback?: string } = {},
) {
  const { fallback = '', ...temporalOptions } = options

  return computed(() => {
    const unrefDuration = toValue(duration)

    if (isAbsent(unrefDuration)) {
      return fallback
    }

    return humanizeDuration(unrefDuration)
  })
}
