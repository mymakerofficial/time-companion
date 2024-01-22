import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";
import {randomTailwindColor} from "@/lib/colorUtils";
import type {ReactiveActivity} from "@/model/activity";
import {now} from "@/lib/timeUtils";

export interface SerializedProject {
  id: string
  childActivityIds: string[]
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  lastUsed: string // ISO string
}

export interface ReactiveProject extends Readonly<HasId> {
  childActivities: ReactiveActivity[]
  displayName: string
  color: Nullable<string>
  isBillable: boolean
  readonly lastUsed: Date
  lastUsedNow: () => void
  //
  toSerialized: () => SerializedProject
}

export interface ProjectInit {
  id?: ID
  childActivities?: ReactiveActivity[]
  displayName?: string
  color?: Nullable<string>
  isBillable?: boolean
  lastUsed?: Date
}

export interface ProjectOptions {
  randomColor: boolean
}

export function fromSerializedProject(serialized: SerializedProject): ProjectInit {
  return {
    id: serialized.id,
    childActivities: [], // will be filled by activity deserialization
    displayName: serialized.displayName,
    color: serialized.color,
    isBillable: serialized.isBillable,
    lastUsed: new Date(serialized.lastUsed),
  }
}

export function createProject(init: ProjectInit, options?: Partial<ProjectOptions>): ReactiveProject {
  const config = reactive({
    id: init.id ?? uuid(),
    childActivities: init.childActivities ?? [],
    displayName: init.displayName ?? '',
    color: init.color ?? (options?.randomColor ? randomTailwindColor() : null),
    isBillable: init.isBillable ?? true,
    lastUsed: init.lastUsed ?? now(),
  })

  function lastUsedNow() {
    config.lastUsed = now()
  }

  function toSerialized(): SerializedProject {
    return {
      id: config.id,
      childActivityIds: config.childActivities.map(it => it.id),
      displayName: config.displayName,
      color: config.color,
      isBillable: config.isBillable,
      lastUsed: config.lastUsed.toISOString(),
    }
  }

  return reactive({
    id: computed(() => config.id),
    childActivities: computed(() => config.childActivities),
    displayName: computed({
      get: () => config.displayName,
      set: (value: string) => config.displayName = value,
    }),
    color: computed({
      get: () => config.color,
      set: (value: Nullable<string>) => config.color = value,
    }),
    isBillable: computed({
      get: () => config.isBillable,
      set: (value: boolean) => config.isBillable = value,
    }),
    lastUsed: computed(() => config.lastUsed),
    lastUsedNow,
    //
    toSerialized,
  })
}