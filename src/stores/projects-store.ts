import {defineStore} from "pinia";
import {reactive} from "vue";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";

export interface ProjectsStore {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  addProject: (project: ReactiveProject) => void
  addActivity: (activity: ReactiveActivity) => void
}

export const useProjectsStore = defineStore('projects', (): ProjectsStore => {
  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function addProject(project: ReactiveProject) {
    if (projects.some((it) => it.displayName === project.displayName)) {
      throw new Error(`Project with displayName ${project.displayName} already exists`)
    }

    projects.push(project)
  }

  function addActivity(activity: ReactiveActivity) {
    if (activities.some((it) => it.displayName === activity.displayName)) {
      throw new Error(`Activity with displayName ${activity.displayName} already exists`)
    }

    activities.push(activity)
  }

  return {
    projects,
    activities,
    addProject,
    addActivity,
  }
})