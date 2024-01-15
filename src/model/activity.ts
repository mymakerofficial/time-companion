import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {HasId, ID} from "@/lib/types";
import type {Nullable} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";
import {now} from "@/lib/time-utils";

export interface SerializedActivity {
  id: string
  parentProjectId: Nullable<ID>
  displayName: string
  color: Nullable<string>
  LastUsed: string // ISO string
}

export interface ReactiveActivity extends Readonly<HasId> {
  parentProject: Nullable<ReactiveProject>
  displayName: string
  color: Nullable<string>
  readonly lastUsed: Date
  lastUsedNow: () => void
  //
  toSerialized: () => SerializedActivity
}

export interface ActivityInit {
  id?: ID
  parentProject?: Nullable<ReactiveProject>
  displayName?: string
  color?: Nullable<string>
  lastUsed?: Date
}

export function fromSerializedActivity(serialized: SerializedActivity): ActivityInit {
  return {
    id: serialized.id,
    displayName: serialized.displayName,
    color: serialized.color,
    lastUsed: new Date(serialized.LastUsed),
  }
}

export function createActivity(init: ActivityInit): ReactiveActivity {
  const config = reactive({
    id: init.id ?? uuid(),
    parentProject: init.parentProject ?? null,
    displayName: init.displayName ?? '',
    color: init.color ?? null,
    lastUsed: init.lastUsed ?? now(),
  })

  function lastUsedNow() {
    config.lastUsed = now()
  }

  function toSerialized(): SerializedActivity {
    return {
      id: config.id,
      parentProjectId: config.parentProject?.id ?? null,
      displayName: config.displayName,
      color: config.color,
      LastUsed: config.lastUsed.toISOString(),
    }
  }

  return reactive({
    id: computed(() => config.id),
    parentProject: computed(() => config.parentProject),
    displayName: computed({
      get: () => config.displayName,
      set: (value: string) => config.displayName = value,
    }),
    color: computed({
      get: () => config.color,
      set: (value: Nullable<string>) => config.color = value,
    }),
    lastUsed: computed(() => config.lastUsed),
    lastUsedNow,
    //
    toSerialized,
  })
}