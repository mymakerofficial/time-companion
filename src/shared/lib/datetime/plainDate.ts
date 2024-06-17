import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import type { PlainTime } from '@shared/lib/datetime/plainTime'

export class PlainDate extends Temporal.PlainDate {
  static from(
    item: Date | Temporal.PlainDate | Temporal.PlainDateLike | string,
    options?: Temporal.AssignmentOptions,
  ): PlainDate {
    if (isDate(item)) {
      return PlainDate.from({
        year: item.getFullYear(),
        month: item.getMonth() + 1,
        day: item.getDate(),
      })
    }

    const fields = Temporal.PlainDate.from(item, options).getISOFields()

    return new PlainDate(
      fields.isoYear,
      fields.isoMonth,
      fields.isoDay,
      fields.calendar,
    )
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day)
  }

  toPlainDateTime(
    temporalDate:
      | PlainTime
      | Temporal.PlainTime
      | Temporal.PlainTimeLike
      | string = { hour: 0, minute: 0, second: 0 },
  ): PlainDateTime {
    return PlainDateTime.fromTemporalPlainDateTime(
      super.toPlainDateTime(temporalDate),
    )
  }
}
