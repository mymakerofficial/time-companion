import {computed, reactive} from "vue";
import type {ReactiveProject} from "@/model/project";
import {isNotNull, type Nullable, runIf} from "@/lib/utils";

export interface ReactiveProjectTimeReport {
  readonly project: Nullable<ReactiveProject>
  projectDisplayName: ReactiveProject['displayName']
  readonly durationMinutes: number
  readonly isOngoing: boolean
}

export interface ProjectTimeReportInit {
  project: Nullable<ReactiveProject>
  durationMinutes: number
  isOngoing: boolean
}

export function createProjectTimeReport(init: ProjectTimeReportInit): ReactiveProjectTimeReport {
  const config = reactive({
    project: init.project,
    durationMinutes: init.durationMinutes,
    isOngoing: init.isOngoing,
  })

  return reactive({
    project: computed(() => config.project),
    projectDisplayName: computed({
      get: () => config.project?.displayName ?? '',
      set: (value) => runIf(config.project, isNotNull, () => config.project!.displayName = value)
    }),
    durationMinutes: computed(() => config.durationMinutes),
    isOngoing: computed(() => config.isOngoing),
  })
}