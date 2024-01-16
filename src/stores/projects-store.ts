import {defineStore} from "pinia";
import {reactive, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity";
import {createProject, fromSerializedProject} from "@/model/project";
import {createActivity, fromSerializedActivity} from "@/model/activity";
import {useLocalStorage} from "@/composables/use-local-storage";
import {isNotNull} from "@/lib/utils";

export interface ProjectsStore {
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  addProject: (project: ReactiveProject) => void
  addActivity: (activity: ReactiveActivity) => void
  link: (project: ReactiveProject, activity: ReactiveActivity) => void
  unlink: (project: ReactiveProject, activity: ReactiveActivity) => void
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

    addProjects(serialized.projects.map((it: any) => createProject(fromSerializedProject(it))))
    addActivities(serialized.activities.map((it: any) => createActivity(fromSerializedActivity(it, { projects }))))
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

  function addProjects(projects: ReactiveProject[]) {
    projects.forEach((it) => addProject(it))
  }

  function addActivity(activity: ReactiveActivity) {
    if (activities.some((it) => it.id === activity.id)) {
      throw new Error(`Activity with id ${activity.id} already exists`)
    }

    if (activities.some((it) => it.displayName === activity.displayName)) {
      throw new Error(`Activity with displayName ${activity.displayName} already exists`)
    }

    activities.push(activity)

    if (activity.parentProject) {
      link(activity.parentProject, activity)
    }
  }

  function addActivities(activities: ReactiveActivity[]) {
    activities.forEach((it) => addActivity(it))
  }

  function unlink(project: ReactiveProject, activity: ReactiveActivity) {
    const index = project.childActivities.findIndex((it) => it.id === activity.id)

    if (index === -1) {
      throw new Error(`Activity with id ${activity.id} does not exist in project ${project.id}`)
    }

    project.childActivities.splice(index, 1)
    activity.parentProject = null
  }

  function link(project: ReactiveProject, activity: ReactiveActivity) {
    if (isNotNull(activity.parentProject) && activity.parentProject.id !== project.id) {
      unlink(activity.parentProject, activity)
    }

    if (project.childActivities.some((it) => it.id === activity.id)) {
      throw new Error(`Activity with id ${activity.id} already exists in project ${project.id}`)
    }

    project.childActivities.push(activity)
    activity.parentProject = project
  }

  return {
    projects,
    activities,
    init,
    addProject,
    addActivity,
    link,
    unlink,
  }
})