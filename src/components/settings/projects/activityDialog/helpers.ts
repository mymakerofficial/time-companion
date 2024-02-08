import type {ReactiveActivity} from "@/model/activity";
import type {Maybe, Nullable} from "@/lib/utils";
import type {ID} from "@/lib/types";
import {createActivity} from "@/model/activity";
import {useProjectsStore} from "@/stores/projectsStore";
import {isNotNull} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";

export interface ActivityForm {
  displayName: ReactiveActivity['displayName'],
  color: ReactiveActivity['color'],
  project: Nullable<ReactiveProject>,
}

export function createActivityForm(activity?: Maybe<ReactiveActivity>): ActivityForm {
  return {
    displayName: activity?.displayName ?? '',
    color: activity?.color ?? null,
    project: activity?.parentProject ?? null,
  }
}

export function createActivityFromForm(form: ActivityForm) {
  return createActivity({
    displayName: form.displayName,
    color: form.color,
    parentProject: form.project,
  })
}

export function patchActivityWithForm(activity: ReactiveActivity, form: ActivityForm) {
  const projectsStore = useProjectsStore()

  activity.displayName = form.displayName
  activity.color = form.color

  if (isNotNull(form.project) && form.project !== activity.parentProject) {
    projectsStore.link(form.project, activity)
  }
}