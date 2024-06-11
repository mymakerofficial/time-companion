import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'

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
}
