import type { ReactiveCalendarReminder } from '@renderer/model/calendarReminder/types'
import { ReminderActionType } from '@renderer/model/calendarReminder/types'
import type { Nullable } from '@renderer/lib/utils'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { ReactiveActivity } from '@renderer/model/activity/types'

export interface ReminderRow {
  id: string
  name: string
  startAt: ReactiveCalendarReminder['startAt']
  action: {
    type: ReminderActionType
    targetProject: Nullable<ReactiveProject>
    targetActivity: Nullable<ReactiveActivity>
  }
}
