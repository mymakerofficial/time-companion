import { Temporal } from "temporal-polyfill";
import {round} from "@renderer/lib/utils";

export function durationToGridRows(duration: Temporal.Duration) {
  const rowsPerHour = 12
  return round(duration.total({
    unit: 'minutes'
  }) / 60 * rowsPerHour)
}

export function rowsToTime(rows: number) {
  const rowsPerHour = 2
  return Temporal.PlainTime.from({
    hour: rows / rowsPerHour
  })
}