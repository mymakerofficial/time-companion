import {v4 as uuid} from "uuid";
import {computed, reactive, ref} from "vue";
import type {ReactiveProject} from "@/model/project";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";

export interface ReactiveActivity extends HasId {
  displayName: Nullable<string>
  projectId: ReactiveProject['id']
  projectDisplayName: ReactiveProject['displayName']
  color: ReactiveProject['color']
}

export interface ActivityInit {
  id?: ID
  project: ReactiveProject
  displayName?: Nullable<string>
}

export function createActivity(init: ActivityInit): ReactiveActivity {
  const config = reactive({
    id: uuid() ?? init.id,
    displayName: init.displayName ?? null,
  })

  const inherits = reactive({
    project: init.project,
  })

  return reactive({
    id: computed(() => config.id),
    displayName: config.displayName,
    projectId: computed(() => inherits.project.id),
    projectDisplayName: computed({
      get: () => inherits.project.displayName,
      set: (value) => inherits.project.displayName = value
    }),
    color: computed({
      get: () => inherits.project.color,
      set: (value) => inherits.project.color = value
    }),
  })
}