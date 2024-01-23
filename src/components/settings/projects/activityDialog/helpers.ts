import type {ReactiveActivity} from "@/model/activity";
import type {Maybe, Nullable} from "@/lib/utils";
import type {ID} from "@/lib/types";
import {createActivity} from "@/model/activity";
import {useProjectsStore} from "@/stores/projectsStore";
import {isNotNull} from "@/lib/utils";

export interface ActivityForm {
  displayName: ReactiveActivity['displayName'],
  color: ReactiveActivity['color'],
  projectId: Nullable<ID>,
}

export function createActivityForm(activity?: Maybe<ReactiveActivity>): ActivityForm {
  return {
    displayName: activity?.displayName ?? '',
    color: activity?.color ?? null,
    projectId: activity?.parentProject?.id ?? null,
  }
}

export function createActivityFromForm(form: ActivityForm) {
  const projectsStore = useProjectsStore()

  return createActivity({
    displayName: form.displayName,
    color: form.color,
    parentProject: projectsStore.getProjectById(form.projectId),
  })
}

export function patchActivityWithForm(activity: ReactiveActivity, form: ActivityForm) {
  const projectsStore = useProjectsStore()

  activity.displayName = form.displayName
  activity.color = form.color

  const project = projectsStore.getProjectById(form.projectId)

  if (isNotNull(form.projectId) && project !== activity.parentProject) {
    projectsStore.link(project, activity)
  }
}