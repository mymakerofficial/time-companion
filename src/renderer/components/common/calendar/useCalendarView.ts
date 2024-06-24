import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { TimeEntryDto } from '@shared/model/timeEntry'
import { useNow } from '@renderer/composables/useNow'
import { Duration } from '@shared/lib/datetime/duration'
import type { PlainTime } from '@shared/lib/datetime/plainTime'
import { durationToGridRows } from '@renderer/components/common/calendar/calendarUtils'

const START_OFFSET = 2 // due to spacing at the top
const MIN_ROW_SPAN = 1 // to prevent too small and negative spans

export function useCalendarViewEntry(
  timeEntry: MaybeRefOrGetter<TimeEntryDto>,
) {
  const now = useNow({ interval: Duration.from({ minutes: 1 }) })

  const containerStyle = computed(() => {
    const { startedAt, stoppedAt } = toValue(timeEntry)

    const startRow =
      durationToGridRows(startedAt.toPlainTime().toDuration()) + START_OFFSET
    const spanRows = Math.max(
      durationToGridRows(startedAt.until(stoppedAt ?? now.value)),
      MIN_ROW_SPAN,
    )

    return {
      gridRow: `${startRow} / span ${spanRows}`,
    }
  })

  return {
    containerStyle,
  }
}

export function useCalendarViewPointer(time: MaybeRefOrGetter<PlainTime>) {
  const containerStyle = computed(() => {
    return {
      gridRow: durationToGridRows(toValue(time).toDuration()) + START_OFFSET,
    }
  })

  return {
    containerStyle,
  }
}
