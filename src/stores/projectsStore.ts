import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity";
import {createProject, fromSerializedProject} from "@/model/project";
import {createActivity, fromSerializedActivity} from "@/model/activity";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {isNotNull, isNull, type Nullable, takeIf} from "@/lib/utils";
import {useCalendarStore} from "@/stores/calendarStore";

export interface ProjectsStore {
  isInitialized: Readonly<Ref<boolean>>
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  getProjectById: (id: ReactiveProject['id']) => Nullable<ReactiveProject>
  getActivityById: (id: ReactiveActivity['id']) => Nullable<ReactiveActivity>
  addProject: (project: Nullable<ReactiveProject>) => void
  addActivity: (activity: Nullable<ReactiveActivity>) => void
  /**
   * Removes a project and all its child activities from the store. Also removes the project and child activities from all events in calendarStore.
   */
  removeProject: (project: Nullable<ReactiveProject>) => void
  /**
   * Removes an activity from the store and removes the activity from all events in calendarStore.
   */
  removeActivity: (activity: Nullable<ReactiveActivity>) => void
  link: (project: Nullable<ReactiveProject>, activity: Nullable<ReactiveActivity>) => void
}

interface ProjectsStorageSerialized {
  projects: SerializedProject[]
  activities: SerializedActivity[]
}

export const useProjectsStore = defineStore('projects', (): ProjectsStore => {
  const calendarStore = useCalendarStore()
  const storage = useLocalStorage<ProjectsStorageSerialized>('time-companion-projects-store', { projects: [], activities: [] })

  const isInitialized = ref(false)

  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function init() {
    // reset
    isInitialized.value = false
    projects.length = 0
    activities.length = 0

    const serialized = storage.get()

    addProjects(serialized.projects.map((it: any) => createProject(fromSerializedProject(it))))
    addActivities(serialized.activities.map((it: any) => createActivity(fromSerializedActivity(it, { projects }))))

    isInitialized.value = true
  }

  function store() {
    storage.set({
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    })
  }

  watch([() => projects, () => activities], store, {deep: true})

  function getProjectIndexById(id: ReactiveProject['id']) {
    const index = projects.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  function getProjectById(id: ReactiveProject['id']) {
    const index = getProjectIndexById(id)
    return takeIf(index, isNotNull, projects[index!])
  }

  function getActivityIndexById(id: ReactiveActivity['id']) {
    const index = activities.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  function getActivityById(id: ReactiveActivity['id']) {
    const index = getActivityIndexById(id)
    return takeIf(index, isNotNull, activities[index!])
  }

  function addProject(project: Nullable<ReactiveProject>) {
    if (isNull(project)) {
      return
    }

    if (isNotNull(getProjectById(project.id))) {
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

  function addActivity(activity: Nullable<ReactiveActivity>) {
    if(isNull(activity)) {
      return
    }

    if (isNotNull(getActivityById(activity.id))) {
      throw new Error(`Activity with id ${activity.id} already exists`)
    }

    if (activities.some((it) => it.displayName === activity.displayName && it.parentProject?.id === activity.parentProject?.id)) {
      throw new Error(`Activity with displayName ${activity.displayName} and same parentProject already exists`)
    }

    activities.push(activity)

    if (activity.parentProject) {
      link(activity.parentProject, activity)
    }
  }

  function addActivities(activities: ReactiveActivity[]) {
    activities.forEach((it) => addActivity(it))
  }

  function removeActivity(activity:  Nullable<ReactiveActivity>) {
    if (isNull(activity)) {
      return
    }

    if (!calendarStore.isInitialized) {
      throw new Error('Tried to remove activity before calendarStore was initialized. This should not happen.')
    }

    if (!isInitialized.value) {
      throw new Error('Tried to remove activity before projectsStore was initialized. This should not happen.')
    }

    if (isNull(getActivityById(activity.id))) {
      throw new Error(`Activity with id ${activity.id} does not exist in projectsStore`)
    }

    if (isNotNull(activity.parentProject)) {
      unlink(activity.parentProject, activity)
    }


    // remove activities from events

    calendarStore.days.forEach((day) => {
      day.events.forEach((event) => {
        if (event.activity?.id === activity.id) {
          event.activity = null
        }
      })
    })

    // remove activity from list

    const index = getActivityIndexById(activity.id)

    if (isNull(index)) {
      throw new Error(`Something went wrong while removing activity ${activity.id} from projectsStore`)
    }

    activities.splice(index, 1)
  }

  function removeProject(project: Nullable<ReactiveProject>) {
    if (isNull(project)) {
      return
    }

    if (!calendarStore.isInitialized) {
      throw new Error('Tried to remove project before calendarStore was initialized. This should not happen.')
    }

    if (!isInitialized.value) {
      throw new Error('Tried to remove project before projectsStore was initialized. This should not happen.')
    }

    if (!projects.some((it) => it.id === project.id)) {
      throw new Error(`Project with id ${project.id} does not exist in projectsStore`)
    }

    project.childActivities.forEach((it) => removeActivity(it))

    // remove project from events

    calendarStore.days.forEach((day) => {
      day.events.forEach((event) => {
        if (event.project?.id === project.id) {
          event.project = null
        }
      })
    })

    // remove project from list

    const index = getProjectIndexById(project.id)

    if (isNull(index)) {
      throw new Error(`Something went wrong while removing project ${project.id} from projectsStore`)
    }

    projects.splice(index, 1)
  }

  function unlink(project: Nullable<ReactiveProject>, activity: Nullable<ReactiveActivity>) {
    if (isNull(project) || isNull(activity)) {
      return
    }

    const index = project.childActivities.findIndex((it) => it.id === activity.id)

    if (index === -1) {
      throw new Error(`Activity with id ${activity.id} does not exist in project ${project.id}`)
    }

    project.childActivities.splice(index, 1)
    activity.parentProject = null
  }

  function link(project: Nullable<ReactiveProject>, activity: Nullable<ReactiveActivity>) {
    if (isNull(project) || isNull(activity)) {
      return
    }

    // TODO: handle events with activity and project

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
    isInitialized: readonly(isInitialized),
    projects,
    activities,
    init,
    getProjectById,
    getActivityById,
    addProject,
    addActivity,
    removeProject,
    removeActivity,
    link,
  }
})