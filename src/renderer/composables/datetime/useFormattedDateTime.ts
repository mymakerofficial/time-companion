import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { Intl } from 'temporal-polyfill'
import { useI18n } from 'vue-i18n'
import type { Maybe } from '@shared/lib/utils/types'

export function useFormattedDateTime(
  dateTime: MaybeRefOrGetter<Maybe<PlainDateTime | PlainDate | PlainTime>>,
  options: Intl.DateTimeFormatOptions & { fallback?: string } = {},
) {
  const { fallback = '', ...temporalOptions } = options
  const { locale } = useI18n()
  return computed(
    () =>
      toValue(dateTime)?.toLocaleString(toValue(locale), temporalOptions) ??
      fallback,
  )
}
