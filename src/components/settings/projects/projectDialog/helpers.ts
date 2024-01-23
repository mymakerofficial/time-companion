import type {ReactiveProject} from "@/model/project";
import {createProject} from "@/model/project";
import type {Maybe} from "@/lib/utils";

export interface ProjectForm {
  displayName: ReactiveProject['displayName'],
  color: ReactiveProject['color'],
  isBillable: ReactiveProject['isBillable'],
}

export function createProjectForm(project?: Maybe<ReactiveProject>): ProjectForm {
  return {
    displayName: project?.displayName ?? '',
    color: project?.color ?? null,
    isBillable: project?.isBillable ?? false,
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