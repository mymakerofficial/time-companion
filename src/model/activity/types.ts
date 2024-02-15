import type {HasId} from "@/lib/types";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/";
import type {LocalDateTime} from "@js-joda/core";
import type {ProjectsStore} from "@/stores/projectsStore";
import {Temporal} from "temporal-polyfill";

export interface ActivityContext extends HasId {
  displayName: string
  color: Nullable<string>
  parentProject: Nullable<ReactiveProject>
  lastUsed: Temporal.PlainDateTime
}

export interface ReactiveActivity extends ActivityContext {
  lastUsedNow: () => void
  toSerialized: () => SerializedActivity
}

export type ActivityInit = Partial<ActivityContext>

export interface SerializedActivity {
  id: string
  displayName: string
  color: Nullable<string>
  parentProjectId: Nullable<string>
  LastUsed: string // ISO Date Time (YYYY-MM-DDTHH:mm:ss)
}

export type ActivityDeserializationAssets = Pick<ProjectsStore,
  'projects'
>