import type {HasId} from "@/lib/types";
import type {ReactiveActivity} from "@/model/activity/types";
import type {Nullable} from "@/lib/utils";
import {Temporal} from 'temporal-polyfill'


export interface ProjectContext extends HasId {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  childActivities: ReactiveActivity[]
  lastUsed: Temporal.PlainDateTime
}

export interface ReactiveProject {
  id: Readonly<ProjectContext['id']>
  childActivities: ReadonlyArray<ReactiveActivity>
  lastUsed: Readonly<ProjectContext['lastUsed']>
  displayName: ProjectContext['displayName']
  isBillable: ProjectContext['isBillable']
  color: ProjectContext['color']
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
  childActivityIds: string[]
  lastUsed: string // ISO Date Time (YYYY-MM-DDTHH:mm:ss)
}

export interface ProjectOptions {
  randomColor: boolean
}