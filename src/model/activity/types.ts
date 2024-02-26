import type {HasId} from "@/lib/types";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project/types";
import type {ProjectsStore} from "@/stores/projectsStore";
import {Temporal} from "temporal-polyfill";

export interface ActivityContext extends Readonly<HasId> {
  displayName: string
  color: Nullable<string>
  parentProject: Nullable<ReactiveProject>
  lastUsed: Temporal.PlainDateTime
}

export interface ReactiveActivity extends ActivityContext {
  readonly parentProject: ActivityContext['parentProject']
  readonly lastUsed: ActivityContext['lastUsed']
  unsafeSetParentProject: (project: Nullable<ReactiveProject>) => void
  lastUsedNow: () => void
  toSerialized: () => SerializedActivity
}

export type ActivityInit = Partial<ActivityContext>

export interface SerializedActivity {
  id: string
  displayName: string
  color: Nullable<string>
  parentProjectId: Nullable<string>
  lastUsed: string // ISO Date Time (YYYY-MM-DDTHH:mm:ss)
}

export type ActivityDeserializationAssets = Pick<ProjectsStore,
  'projects'
>