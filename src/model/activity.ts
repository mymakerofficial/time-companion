import {v4 as uuid} from "uuid";
import {computed, reactive} from "vue";
import type {HasId, ID} from "@/lib/types";

export interface SerializedActivity {
  id: string
  displayName: string
}

export interface ReactiveActivity extends Readonly<HasId> {
  displayName: string
  //
  toSerialized: () => SerializedActivity
}

export interface ActivityInit {
  id?: ID
  displayName?: string
}

export function fromSerializedActivity(serialized: SerializedActivity): ActivityInit {
  return {
    id: serialized.id,
    displayName: serialized.displayName,
  }
}

export function createActivity(init: ActivityInit): ReactiveActivity {
  const config = reactive({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
  })

  function toSerialized(): SerializedActivity {
    return {
      id: config.id,
      displayName: config.displayName,
    }
  }

  return reactive({
    id: computed(() => config.id),
    displayName: computed({
      get: () => config.displayName,
      set: (value: string) => config.displayName = value,
    }),
    //
    toSerialized,
  })
}