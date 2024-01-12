import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";
import {randomTailwindColor} from "@/lib/color-utils";

export interface SerializedProject {
  id: string
  displayName: string
  color: Nullable<string>
}

export interface ReactiveProject extends Readonly<HasId> {
  displayName: string
  color: Nullable<string>
  toSerialized: () => SerializedProject
}

export interface ProjectInit {
  id?: ID
  displayName?: string
  color?: Nullable<string>
}

export interface ProjectOptions {
  randomColor: boolean
}

export function fromSerializedProject(serialized: SerializedProject): ProjectInit {
  return {
    id: serialized.id,
    displayName: serialized.displayName,
    color: serialized.color,
  }
}

export function createProject(init: ProjectInit, options?: Partial<ProjectOptions>): ReactiveProject {
  const config = reactive({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? (options?.randomColor ? randomTailwindColor() : null),
  })

  function toSerialized(): SerializedProject {
    return {
      id: config.id,
      displayName: config.displayName,
      color: config.color,
    }
  }

  return reactive({
    id: computed(() => config.id),
    displayName: computed({
      get: () => config.displayName,
      set: (value: string) => config.displayName = value,
    }),
    color: computed({
      get: () => config.color,
      set: (value: Nullable<string>) => config.color = value,
    }),
    //
    toSerialized,
  })
}