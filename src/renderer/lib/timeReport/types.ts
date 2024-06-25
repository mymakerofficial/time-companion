import type { ReactiveProject } from '@renderer/model/project/types'
import type { Duration } from '@shared/lib/datetime/duration'
import type { PlainDate } from '@shared/lib/datetime/plainDate'

export interface TimeReportProjectEntry {
  project: Readonly<ReactiveProject>
  duration: Readonly<Duration>
  isBillable: Readonly<boolean>
  isRunning: Readonly<boolean>
}

export interface DayTimeReport {
  date: Readonly<PlainDate>
  totalDuration: Readonly<Duration>
  totalBillableDuration: Readonly<Duration>
  entries: ReadonlyArray<TimeReportProjectEntry>
}
