import type {RepeatOnWeekdays} from "@/model/calendarReminder";

export const weekDayNames: Record<keyof RepeatOnWeekdays, string> = {
  ['monday']: 'Mo',
  ['tuesday']: 'Tu',
  ['wednesday']: 'We',
  ['thursday']: 'Th',
  ['friday']: 'Fr',
  ['saturday']: 'Sa',
  ['sunday']: 'Su',
}