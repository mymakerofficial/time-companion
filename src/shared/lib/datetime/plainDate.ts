import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'

export class PlainDate extends Temporal.PlainDate {
  static from(
    item: Date | Temporal.PlainDate | Temporal.PlainDateLike | string,
    options?: Temporal.AssignmentOptions,
  ): PlainDate {
    if (isDate(item)) {
      return Temporal.PlainDate.from({
        year: item.getFullYear(),
        month: item.getMonth() + 1,
        day: item.getDate(),
      })
    }

    return Temporal.PlainDate.from(item, options)
  }
}
