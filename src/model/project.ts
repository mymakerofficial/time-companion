import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";

export interface ReactiveProject extends HasId {
  displayName: string
  color: Nullable<string>
}

export interface ProjectInit {
  id?: ID
  displayName?: string
  color?: Nullable<string>
}

export function createProject(init: ProjectInit): ReactiveProject {
  const config = reactive({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? null,
  })

  return reactive({
    id: computed(() => config.id),
    displayName: config.displayName,
    color: config.color,
  })
}