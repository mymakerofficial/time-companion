import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Maybe } from '@shared/lib/utils/types'
import { humanizeDuration } from '@renderer/lib/neoTime'
import type { Duration } from '@shared/lib/datetime/duration'
import { isAbsent } from '@shared/lib/utils/checks'

export function useFormattedDuration(
  duration: MaybeRefOrGetter<Maybe<Duration>>,
  options: { includeSeconds?: boolean; fallback?: string } = {},
) {
  const { fallback = '', ...humanizeOptions } = options

  return computed(() => {
    const unrefDuration = toValue(duration)

    if (isAbsent(unrefDuration)) {
      return fallback
    }

    return humanizeDuration(unrefDuration, humanizeOptions)
  })
}
