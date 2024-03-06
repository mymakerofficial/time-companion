import type {ReactiveProject} from "@/model/project/types";
import {Temporal} from "temporal-polyfill";

export interface TimeReportProjectEntry {
  project: Readonly<ReactiveProject>
  duration: Readonly<Temporal.Duration>
  isBillable: Readonly<boolean>
  isRunning: Readonly<boolean>
}

export interface DayTimeReport {
  date: Readonly<Temporal.PlainDate>
  totalBillableDuration: Readonly<Temporal.Duration>
  entries: ReadonlyArray<TimeReportProjectEntry>
}
