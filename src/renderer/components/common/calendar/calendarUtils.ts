import { round } from '@renderer/lib/utils'
import { PlainTime } from '@shared/lib/datetime/plainTime'
import type { Duration } from '@shared/lib/datetime/duration'

export function durationToGridRows(duration: Duration) {
  const rowsPerHour = 12
  const minutes = duration.total({
    unit: 'minutes',
  })
  return round((minutes / 60) * rowsPerHour)
}

export function rowsToTime(rows: number) {
  const rowsPerHour = 2
  return PlainTime.from({
    hour: rows / rowsPerHour,
  })
}
