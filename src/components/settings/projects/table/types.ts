import type {Nullable} from "@/lib/utils";
import type {ReactiveCalendarEventShadow} from "@/model/calendarEventShadow";

export interface ProjectRow {
  id: string
  shadow: ReactiveCalendarEventShadow
  isBillable: Nullable<boolean>
  color: Nullable<string>
  lastUsed: Date
  activities?: ProjectRow[]
  isProject: boolean
}
