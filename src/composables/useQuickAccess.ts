import {useProjectsStore} from "@/stores/projectsStore";
import type {ReactiveProject} from "@/model/project/";
import type {ReactiveActivity} from "@/model/activity/";
import {type  MaybeRefOrGetter, ref, toRefs, toValue, watchEffect} from "vue";
import {createEventShadow, type ReactiveCalendarEventShadow} from "@/model/eventShadow";
import type {Nullable} from "@/lib/utils";
import {isNull} from "@/lib/utils";
import {isAfter} from "@/lib/neoTime";

function byLastUsed(a: ReactiveProject | ReactiveActivity, b: ReactiveProject | ReactiveActivity) {
  return isAfter(a.lastUsed, b.lastUsed) ? -1 : 1
}

export interface UseQuickAccessOptions {
  maxActivitiesPerProject?: number
  maxShadows?: number
  // only return shadows with the given project
  project?: Nullable<ReactiveProject>
  // don't include the given shadow
  exclude?: Nullable<ReactiveCalendarEventShadow>
}

export function useQuickAccess(options?: MaybeRefOrGetter<UseQuickAccessOptions>) {
  const { projects } = useProjectsStore()

  const shadows = ref<ReactiveCalendarEventShadow[]>([])

  watchEffect(() => {
    const {
      maxActivitiesPerProject = 3,
      maxShadows = 12,
      project: projectFilter = null,
      exclude = null,
    } = toValue(options ?? {})

    shadows.value = projects
      .filter((project) => isNull(projectFilter) || project === projectFilter)
      .flatMap((project) => {
        return [
          ...project.childActivities.sort(byLastUsed).map((activity) => createEventShadow({ project, activity })).slice(0, maxActivitiesPerProject),
          createEventShadow({ project })
        ]
      })
      .sort((a, b) => byLastUsed(
        a.activity ?? a.project,
        b.activity ?? b.project
      ))
      .slice(0, maxShadows)
      .filter((shadow) =>
        shadow.project !== exclude?.project ||
        shadow.activity !== exclude?.activity
      )
  })

  return shadows
}