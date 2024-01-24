import type {RepeatOnWeekdays} from "@/model/calendarReminder";
import {weekDayNames} from "@/components/common/inputs/repeatOn/constants";

export function repeatOnWeekdaysToReadableString(repeatOn: RepeatOnWeekdays): string {
  const days = Object.keys(repeatOn).map((key) => {
     return {
       key,
       value: repeatOn[key as keyof RepeatOnWeekdays]
     }
    })
    .filter((day) => day.value)
    .map((day) => day.key)
    .map((key) => weekDayNames[key as keyof RepeatOnWeekdays])

  return days.join(', ')
}