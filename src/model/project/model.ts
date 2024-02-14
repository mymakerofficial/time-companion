import {reactive} from "vue";
import {v4 as uuid} from "uuid";
import {randomTailwindColor} from "@/lib/colorUtils";
import type {ProjectInit, ProjectOptions, ReactiveProject} from "@/model/project/";
import {now} from "@/lib/neoTime";
import type {ProjectContext} from "@/model/project/";
import {serializeProject} from "@/model/project/";
import {mapReadonly, mapWritable} from "@/model/modelHelpers";

export function createProject(init: ProjectInit, options?: ProjectOptions): ReactiveProject {
  const ctx = reactive<ProjectContext>({
    id: init.id ?? uuid(),
    displayName: init.displayName ?? '',
    color: init.color ?? (options?.randomColor ? randomTailwindColor() : null),
    isBillable: init.isBillable ?? true,
    childActivities: init.childActivities ?? [],
    lastUsed: init.lastUsed ?? now(),
  })

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
    ]),
    ...mapWritable(ctx, [
      'displayName',
      'color',
      'isBillable',
    ]),
    lastUsedNow,
    toSerialized,
  })
}