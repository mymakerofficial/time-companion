import type {Nullable} from "@/lib/utils";
import type {ReactiveCalendarEventShadow} from "@/model/eventShadow";
import type {ReactiveProject} from "@/model/project";

export interface ProjectRow {
  id: string
  shadow: ReactiveCalendarEventShadow
  isBillable: Nullable<boolean>
  color: ReactiveProject['color']
  lastUsed: ReactiveProject['lastUsed']
  activities?: ProjectRow[]
  isProject: boolean
}
