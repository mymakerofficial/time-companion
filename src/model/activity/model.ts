import {reactive} from "vue";
import {v4 as uuid} from "uuid";
import type {ActivityContext, ActivityInit, ReactiveActivity} from "@/model/activity/types";
import {serializeActivity} from "@/model/activity/serializer";
import {now} from "@/lib/neoTime";
import {mapReadonly, mapWritable} from "@/model/modelHelpers";
import type {ReactiveProject} from "@/model/project/types";
import type {Nullable} from "@/lib/utils";

export function createActivity(init: ActivityInit): ReactiveActivity {
  const ctx = reactive<ActivityContext>({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? null,
    parentProject: init.parentProject ?? null,
    lastUsed: init.lastUsed ?? now(),
  })

  function unsafeSetParentProject(parentProject: Nullable<ReactiveProject>) {
    ctx.parentProject = parentProject
  }

  function lastUsedNow() {
    ctx.lastUsed = now()
  }

  function toSerialized() {
    return serializeActivity(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, [
      'id',
      'parentProject',
      'lastUsed',
    ]),
    ...mapWritable(ctx, [
      'displayName',
      'color',
    ]),
    unsafeSetParentProject,
    lastUsedNow,
    toSerialized,
  })
}