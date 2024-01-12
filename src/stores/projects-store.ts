import {defineStore} from "pinia";
import {reactive, watch} from "vue";
import type {ReactiveProject} from "@/model/project";
import type {ReactiveActivity} from "@/model/activity";
import {createProject, fromSerializedProject} from "@/model/project";
import {createActivity, fromSerializedActivity} from "@/model/activity";

export interface ProjectsStore {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  addProject: (project: ReactiveProject) => void
  addActivity: (activity: ReactiveActivity) => void
}

export const useProjectsStore = defineStore('projects', (): ProjectsStore => {
  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function init() {
    const serialized = localStorage.getItem('time-companion-projects-store')
    if (!serialized) {
      return
    }

    const parsed = JSON.parse(serialized)
    projects.push(...parsed.projects.map((it: any) => createProject(fromSerializedProject(it))))
    activities.push(...parsed.activities.map((it: any) => createActivity(fromSerializedActivity(it))))
  }

  function store() {
    const serialized = {
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    }

    localStorage.setItem('time-companion-projects-store', JSON.stringify(serialized))
  }

  watch([() => projects, () => activities], store, {deep: true})

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
    init,
    addProject,
    addActivity,
  }
})