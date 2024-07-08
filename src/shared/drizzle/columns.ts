import { customType, integer } from 'drizzle-orm/sqlite-core'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'
import { Duration } from '@shared/lib/datetime/duration'
import { PlainDate } from '@shared/lib/datetime/plainDate'

/***
 * A plain date-time represented as a signed integer of milliseconds since the Unix epoch.
 */
export function plainDateTime(name: string) {
  return customType<{
    data: PlainDateTime
    driverData: number
  }>({
    dataType() {
      return 'integer'
    },
    fromDriver(value) {
      return PlainDateTime.Epoch.add({ milliseconds: value })
    },
    toDriver(value) {
      return PlainDateTime.Epoch.until(value).total({ unit: 'milliseconds' })
    },
  })(name)
}

/***
 * A plain date represented as a signed integer of days since the Unix epoch date.
 */
export function plainDate(name: string) {
  return customType<{
    data: PlainDate
    driverData: number
  }>({
    dataType() {
      return 'integer'
    },
    fromDriver(value) {
      return PlainDate.Epoch.add({ days: value })
    },
    toDriver(value) {
      return PlainDate.Epoch.until(value).total({ unit: 'days' })
    },
  })(name)
}

/***
 * Duration represented as a signed integer of milliseconds.
 */
export function duration(name: string) {
  return customType<{
    data: Duration
    driverData: number
  }>({
    dataType() {
      return 'integer'
    },
    fromDriver(value) {
      return Duration.from({ milliseconds: value })
    },
    toDriver(value) {
      return value.total({ unit: 'milliseconds' })
    },
  })(name)
}

/***
 * A signed integer representing a boolean value.
 * @see https://orm.drizzle.team/docs/column-types/sqlite#integer
 */
export function boolean(name: string) {
  return integer(name, { mode: 'boolean' })
}
