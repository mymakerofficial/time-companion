import type { HasId } from '@renderer/lib/types'
import type { Nullable } from '@renderer/lib/utils'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { ProjectsStore } from '@renderer/stores/projectsStore'
import type { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

export interface ActivityContext extends Readonly<HasId> {
  displayName: string
  color: Nullable<string>
  parentProject: Nullable<ReactiveProject>
  lastUsed: PlainDateTime
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

export type ActivityDeserializationAssets = Pick<ProjectsStore, 'projects'>
