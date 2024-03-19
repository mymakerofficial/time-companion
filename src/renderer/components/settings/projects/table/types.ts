import type { Nullable } from '@renderer/lib/utils'
import type { ReactiveCalendarEventShadow } from '@renderer/model/eventShadow/types'
import type { ReactiveProject } from '@renderer/model/project/types'

export interface ProjectRow {
  id: string
  shadow: ReactiveCalendarEventShadow
  isBillable: Nullable<boolean>
  color: ReactiveProject['color']
  lastUsed: ReactiveProject['lastUsed']
  activities: ProjectRow[]
  parentProjectId: Nullable<string>
  isProject: boolean
}
