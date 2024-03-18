import {reactive} from "vue";
import {v4 as uuid} from "uuid";
import {randomTailwindColor} from "@renderer/lib/colorUtils";
import type {ProjectContext, ProjectInit, ProjectOptions, ReactiveProject} from "@renderer/model/project/types";
import {now} from "@renderer/lib/neoTime";
import {serializeProject} from "@renderer/model/project/serializer";
import {mapReadonly, mapWritable} from "@renderer/model/modelHelpers";
import type {ReactiveActivity} from "@renderer/model/activity/types";
import {check} from "@renderer/lib/utils";

export function createProject(init: ProjectInit, options?: ProjectOptions): ReactiveProject {
  const ctx = reactive<ProjectContext>({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? (options?.randomColor ? randomTailwindColor() : null),
    isBillable: init.isBillable ?? true,
    isBreak: init.isBreak ?? false,
    childActivities: init.childActivities ?? [],
    lastUsed: init.lastUsed ?? now(),
  })

  function unsafeSetIsBreak(value: boolean) {
    ctx.isBreak = value
  }

  function unsafeAddChildActivity(activity: ReactiveActivity) {
    ctx.childActivities.push(activity)
  }

  function unsafeRemoveChildActivity(activity: ReactiveActivity) {
    const index = ctx.childActivities.indexOf(activity)

    check(index !== -1, `Failed to remove child activity "${activity.id}": Activity does not exist as child of project "${ctx.id}".`)

    ctx.childActivities.splice(index, 1)
  }

  function lastUsedNow() {
    ctx.lastUsed = now()
  }

  function toSerialized() {
    return serializeProject(ctx)
  }

  return reactive({
    ...mapReadonly(ctx, [
      'id',
      'lastUsed',
      'childActivities',
      'isBreak',
    ]),
    ...mapWritable(ctx, [
      'displayName',
      'color',
      'isBillable',
    ]),
    unsafeSetIsBreak,
    unsafeAddChildActivity,
    unsafeRemoveChildActivity,
    lastUsedNow,
    toSerialized,
  })
}