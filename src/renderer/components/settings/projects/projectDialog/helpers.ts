import type {ReactiveProject} from "@renderer/model/project/types";
import {createProject} from "@renderer/model/project/model";
import type {Maybe} from "@renderer/lib/utils";
import {randomTailwindColor} from "@renderer/lib/colorUtils";

export interface ProjectForm {
  displayName: ReactiveProject['displayName'],
  color: ReactiveProject['color'],
  isBillable: ReactiveProject['isBillable'],
}

export function createProjectForm(project?: Maybe<ReactiveProject>): ProjectForm {
  return {
    displayName: project?.displayName ?? '',
    color: project?.color ?? randomTailwindColor(),
    isBillable: project?.isBillable ?? true,
  }
}

export function createProjectFromForm(form: ProjectForm) {
  return createProject({
    displayName: form.displayName,
    color: form.color,
    isBillable: form.isBillable,
  })
}

export function patchProjectWithForm(project: ReactiveProject, form: ProjectForm) {
  project.displayName = form.displayName
  project.color = form.color
  project.isBillable = form.isBillable
}