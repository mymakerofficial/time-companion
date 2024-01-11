import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {HasId, ID} from "@/lib/types";

export interface ReactiveActivity extends HasId {
  displayName: string
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