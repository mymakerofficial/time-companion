import { Temporal } from "temporal-polyfill";

export function durationToGridRows(duration: Temporal.Duration) {
  const rowsPerHour = 12
  return Math.round(duration.total({
    unit: 'minutes'
  }) / 60 * rowsPerHour)
}