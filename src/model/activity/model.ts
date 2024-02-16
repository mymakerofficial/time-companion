import {reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {ActivityInit, ReactiveActivity, ActivityContext} from "@/model/activity/types";
import {serializeActivity} from "@/model/activity/serializer";
import {now} from "@/lib/neoTime";
import {mapReadonly, mapWritable} from "@/model/modelHelpers";

export function createActivity(init: ActivityInit): ReactiveActivity {
  const ctx = reactive<ActivityContext>({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? null,
    parentProject: init.parentProject ?? null,
    lastUsed: init.lastUsed ?? now(),
  })

  function lastUsedNow() {
    ctx.lastUsed = now()
  }

  function toSerialized() {
    return serializeActivity(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, [
      'id',
      'lastUsed',
    ]),
    ...mapWritable(ctx, [
      'parentProject',
      'displayName',
      'color',
    ]),
    lastUsedNow,
    toSerialized,
  })
}