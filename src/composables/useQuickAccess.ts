import {useProjectsStore} from "@/stores/projectsStore";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {computed} from "vue";
import {createEventShadow} from "@/model/calendarEventShadow";

function byLastUsed(a: ReactiveProject | ReactiveActivity, b: ReactiveProject | ReactiveActivity) {
  return a.lastUsed > b.lastUsed ? -1 : 1
}

export function useQuickAccess() {
  const { projects } = useProjectsStore()

  const maxActivitiesPerProject = 3
  const maxShadows = 12

  return computed(() => {
    return projects
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
  })
}