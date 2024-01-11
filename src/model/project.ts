import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";
import {randomTailwindColor} from "@/lib/color-utils";

export interface ReactiveProject extends HasId {
  displayName: string
  color: Nullable<string>
}

export interface ProjectInit {
  id?: ID
  displayName?: string
  color?: Nullable<string>
}

export interface ProjectOptions {
  randomColor: boolean
}

export function createProject(init: ProjectInit, options?: Partial<ProjectOptions>): ReactiveProject {
  const config = reactive({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? (options?.randomColor ? randomTailwindColor() : null),
  })

  return reactive({
    id: computed(() => config.id),
    displayName: config.displayName,
    color: config.color,
  })
}