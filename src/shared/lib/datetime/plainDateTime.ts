import { Temporal } from 'temporal-polyfill'
import { isDate } from '@shared/lib/utils/checks'

export class PlainDateTime extends Temporal.PlainDateTime {
  static from(
    item: Date | Temporal.PlainDateTime | Temporal.PlainDateTimeLike | string,
    options?: Temporal.AssignmentOptions,
  ): PlainDateTime {
    if (isDate(item)) {
      return Temporal.PlainDateTime.from({
        year: item.getFullYear(),
        month: item.getMonth() + 1,
        day: item.getDate(),
        hour: item.getHours(),
        minute: item.getMinutes(),
        second: item.getSeconds(),
        millisecond: item.getMilliseconds(),
      })
    }

    return Temporal.PlainDateTime.from(item, options)
  }
}
