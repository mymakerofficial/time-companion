import type { HasId } from '@renderer/lib/types'
import type { ReactiveActivity } from '@renderer/model/activity/types'
import type { Nullable } from '@renderer/lib/utils'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export interface ProjectContext extends HasId {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
  childActivities: ReactiveActivity[]
  lastUsed: PlainDateTime
}

export interface ReactiveProject {
  readonly id: ProjectContext['id']
  childActivities: ReadonlyArray<ReactiveActivity>
  readonly lastUsed: ProjectContext['lastUsed']
  displayName: ProjectContext['displayName']
  isBillable: ProjectContext['isBillable']
  readonly isBreak: ProjectContext['isBreak']
  color: ProjectContext['color']
  unsafeSetIsBreak: (isBreak: boolean) => void
  unsafeAddChildActivity: (activity: ReactiveActivity) => void
  unsafeRemoveChildActivity: (activity: ReactiveActivity) => void
  lastUsedNow: () => void
  toSerialized: () => SerializedProject
}

export type ProjectInit = Partial<ProjectContext>

export interface SerializedProject {
  id: string
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  isBreak: boolean
  childActivityIds: string[]
  lastUsed: string // ISO Date Time (YYYY-MM-DDTHH:mm:ss)
}

export interface ProjectOptions {
  randomColor: boolean
}
