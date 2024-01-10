import {v4 as uuid} from "uuid";
import {computed, reactive, ref} from "vue";
import type {ReactiveProject} from "@/model/project";
import type {Nullable} from "@/lib/utils";
import type {HasId, ID} from "@/lib/types";

export interface ReactiveActivity extends HasId {
  displayName: string
  color: ReactiveProject['color']
}

export interface ActivityInit {
  id?: ID
  displayName?: string
}

export function createActivity(init: ActivityInit): ReactiveActivity {
  const config = reactive({
    id: uuid() ?? init.id,
    displayName: init.displayName ?? '',
  })

  return reactive({
    id: computed(() => config.id),
    displayName: config.displayName,
  })
}