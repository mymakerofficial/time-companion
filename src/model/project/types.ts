import type {HasId} from "@/lib/types";
import type {ReactiveActivity} from "@/model/activity/";
import type {Nullable} from "@/lib/utils";
import type {LocalDateTime} from "@js-joda/core";
import { Temporal } from 'temporal-polyfill'


export interface ProjectContext extends HasId {
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  childActivities: ReactiveActivity[]
  lastUsed: Temporal.PlainDateTime
}

export interface ReactiveProject extends ProjectContext {
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