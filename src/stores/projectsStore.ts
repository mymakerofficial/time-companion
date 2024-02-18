import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project/";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity/";
import {createProject, fromSerializedProject} from "@/model/project/";
import {createActivity, fromSerializedActivity} from "@/model/activity/";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {isNotDefined, isNotNull, isNull, type Maybe, type Nullable, takeIf} from "@/lib/utils";
import {useCalendarStore} from "@/stores/calendarStore";
import {useNotifyError} from "@/composables/useNotifyError";

export interface ProjectsStore {
  isInitialized: Readonly<Ref<boolean>>
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  getProjectById: (id: Maybe<ReactiveProject['id']>) => Nullable<ReactiveProject>
  getActivityById: (id: Maybe<ReactiveActivity['id']>) => Nullable<ReactiveActivity>
  addProject: (project: Maybe<ReactiveProject>) => void
  addActivity: (activity: Maybe<ReactiveActivity>) => void
  /**
   * Removes a project and all its child activities from the store. Also removes the project and child activities from all events in calendarStore.
   */
  removeProject: (project: Maybe<ReactiveProject>) => void
  /**
   * Removes an activity from the store and removes the activity from all events in calendarStore.
   */
  removeActivity: (activity: Maybe<ReactiveActivity>) => void
  link: (project: Maybe<ReactiveProject>, activity: Maybe<ReactiveActivity>) => void
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
    if (isInitialized.value) {
      return
    }

    try {
      const serialized = storage.get()

      addProjects(serialized.projects.map((it: any) => createProject(fromSerializedProject(it))))
      addActivities(serialized.activities.map((it: any) => createActivity(fromSerializedActivity(it, { projects }))))

      isInitialized.value = true
    } catch(error) {
      useNotifyError({
        title: 'Failed to load projects',
        message: 'Your projects and activity data could not be loaded. Data may be corrupted or missing.',
        actions: [{
          label: 'Delete projects data',
          handler: () => {
            storage.clear()
            init()
          }
        }],
        error
      })
    }

  }

  function commit() {
    if (!isInitialized.value) {
      throw new Error('Tried to commit projects store before it was initialized')
    }

    storage.set({
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    })
  }

  watch([() => projects, () => activities], commit, {deep: true})

  function getProjectIndexById(id: Maybe<ReactiveProject['id']>) {
    const index = projects.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  function getProjectById(id: Maybe<ReactiveProject['id']>) {
    const index = getProjectIndexById(id)
    return takeIf(index, isNotNull, projects[index!])
  }

  function getActivityIndexById(id: Maybe<ReactiveActivity['id']>) {
    const index = activities.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  function getActivityById(id: Maybe<ReactiveActivity['id']>) {
    const index = getActivityIndexById(id)
    return takeIf(index, isNotNull, activities[index!])
  }

  function addProject(project: Maybe<ReactiveProject>) {
    if (isNotDefined(project)) {
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

  function addActivity(activity: Maybe<ReactiveActivity>) {
    if(isNotDefined(activity)) {
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

  function removeActivity(activity:  Maybe<ReactiveActivity>) {
    if (isNotDefined(activity)) {
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

    calendarStore.forEachEvent((event) => {
      if (event.activity?.id === activity.id) {
        event.activity = null
      }
    })

    // remove activity from list

    const index = getActivityIndexById(activity.id)

    if (isNull(index)) {
      throw new Error(`Something went wrong while removing activity ${activity.id} from projectsStore`)
    }

    activities.splice(index, 1)
  }

  function removeProject(project: Maybe<ReactiveProject>) {
    if (isNotDefined(project)) {
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

    calendarStore.forEachEvent((event) => {
      if (event.project?.id === project.id) {
        event.project = null
      }
    })

    // remove project from list

    const index = getProjectIndexById(project.id)

    if (isNull(index)) {
      throw new Error(`Something went wrong while removing project ${project.id} from projectsStore`)
    }

    projects.splice(index, 1)
  }

  function unlink(project: Maybe<ReactiveProject>, activity: Maybe<ReactiveActivity>) {
    if (isNotDefined(project) || isNotDefined(activity)) {
      return
    }

    const index = project.childActivities.findIndex((it) => it.id === activity.id)

    if (index === -1) {
      throw new Error(`Activity with id ${activity.id} does not exist in project ${project.id}`)
    }

    project.childActivities.splice(index, 1)
    activity.parentProject = null
  }

  function link(project: Maybe<ReactiveProject>, activity: Maybe<ReactiveActivity>) {
    if (isNotDefined(project) || isNotDefined(activity)) {
      return
    }

    if (project.childActivities.some((it) => it.id === activity.id)) {
      throw new Error(`Activity with id ${activity.id} already exists in project ${project.id}`)
    }

    if (isNotNull(activity.parentProject) && activity.parentProject.id !== project.id) {
      unlink(activity.parentProject, activity)
    }

    project.childActivities.push(activity)
    activity.parentProject = project

    // change project of all events with this activity

    calendarStore.forEachEvent((event) => {
      if (event.activity?.id === activity.id) {
        event.project = project
      }
    })
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