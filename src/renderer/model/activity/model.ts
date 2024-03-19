import { reactive } from 'vue'
import { v4 as uuid } from 'uuid'
import type {
  ActivityContext,
  ActivityInit,
  ReactiveActivity,
} from '@renderer/model/activity/types'
import { serializeActivity } from '@renderer/model/activity/serializer'
import { now } from '@renderer/lib/neoTime'
import { mapReadonly, mapWritable } from '@renderer/model/modelHelpers'
import type { ReactiveProject } from '@renderer/model/project/types'
import type { Nullable } from '@renderer/lib/utils'

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
    ...mapReadonly(ctx, ['id', 'parentProject', 'lastUsed']),
    ...mapWritable(ctx, ['displayName', 'color']),
    unsafeSetParentProject,
    lastUsedNow,
    toSerialized,
  })
}
