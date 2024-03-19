import type { ReactiveProject } from '@renderer/model/project/types'
import type { ReactiveActivity } from '@renderer/model/activity/types'
import { type MaybeRefOrGetter, ref, toValue, watchEffect } from 'vue'
import type { ReactiveCalendarEventShadow } from '@renderer/model/eventShadow/types'
import { createEventShadow } from '@renderer/model/eventShadow/model'
import type { Nullable } from '@renderer/lib/utils'
import { isNull } from '@renderer/lib/utils'
import { useProjectsService } from '@renderer/services/projectsService'
import { dateTimeCompare } from '@renderer/lib/neoTime'

function byLastUsed(
  a: ReactiveProject | ReactiveActivity,
  b: ReactiveProject | ReactiveActivity,
) {
  return -dateTimeCompare(a.lastUsed, b.lastUsed)
}

export interface UseQuickAccessOptions {
  maxActivitiesPerProject?: number
  maxShadows?: number
  // only return shadows with the given project
  project?: Nullable<ReactiveProject>
  // don't include the given shadow
  exclude?: Nullable<ReactiveCalendarEventShadow>
}

export function useQuickAccess(
  options?: MaybeRefOrGetter<UseQuickAccessOptions>,
) {
  const { projects } = useProjectsService()

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
          ...[...project.childActivities]
            .sort(byLastUsed)
            .map((activity) => createEventShadow({ project, activity }))
            .slice(0, maxActivitiesPerProject),
          createEventShadow({ project }),
        ]
      })
      .sort((a, b) =>
        byLastUsed(a.activity ?? a.project, b.activity ?? b.project),
      )
      .slice(0, maxShadows)
      .filter(
        (shadow) =>
          shadow.project !== exclude?.project ||
          shadow.activity !== exclude?.activity,
      )
  })

  return shadows
}
