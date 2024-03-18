import type {ReactiveActivity} from "@renderer/model/activity/types";
import type {Maybe, Nullable} from "@renderer/lib/utils";
import {isNotNull} from "@renderer/lib/utils";
import {createActivity} from "@renderer/model/activity/model";
import type {ReactiveProject} from "@renderer/model/project/types";
import {useProjectsService} from "@renderer/services/projectsService";

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
  const projectsService = useProjectsService()

  activity.displayName = form.displayName
  activity.color = form.color

  if (isNotNull(form.project) && form.project !== activity.parentProject) {
    projectsService.link(form.project, activity)
  }
}