import {defineStore} from "pinia";
import {reactive, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity";
import {createProject, fromSerializedProject} from "@/model/project";
import {createActivity, fromSerializedActivity} from "@/model/activity";
import {useLocalStorage} from "@/composables/use-local-storage";

export interface ProjectsStore {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  addProject: (project: ReactiveProject) => void
  addActivity: (activity: ReactiveActivity) => void
}

interface ProjectsStorageSerialized {
  projects: SerializedProject[]
  activities: SerializedActivity[]
}

export const useProjectsStore = defineStore('projects', (): ProjectsStore => {
  const storage = useLocalStorage<ProjectsStorageSerialized>('time-companion-projects-store', { projects: [], activities: [] })

  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function init() {
    // reset
    projects.length = 0
    activities.length = 0

    const serialized = storage.get()

    projects.push(...serialized.projects.map((it: any) => createProject(fromSerializedProject(it))))
    activities.push(...serialized.activities.map((it: any) => createActivity(fromSerializedActivity(it))))
  }

  function store() {
    storage.set({
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    })
  }

  watch([() => projects, () => activities], store, {deep: true})

  function addProject(project: ReactiveProject) {
    if (activities.some((it) => it.id === project.id)) {
      throw new Error(`Activity with id ${project.id} already exists`)
    }

    if (projects.some((it) => it.displayName === project.displayName)) {
      throw new Error(`Project with displayName ${project.displayName} already exists`)
    }

    projects.push(project)
  }

  function addActivity(activity: ReactiveActivity) {
    if (activities.some((it) => it.id === activity.id)) {
      throw new Error(`Activity with id ${activity.id} already exists`)
    }

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