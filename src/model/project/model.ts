import {reactive} from "vue";
import {v4 as uuid} from "uuid";
import {randomTailwindColor} from "@/lib/colorUtils";
import type {ProjectInit, ProjectOptions, ReactiveProject, ProjectContext} from "@/model/project/types";
import {now} from "@/lib/neoTime";
import {serializeProject} from "@/model/project/serializer";
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