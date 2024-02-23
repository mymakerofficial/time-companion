import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project/types";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity/types";
import {fromSerializedProject} from "@/model/project/serializer";
import {createProject} from "@/model/project/model";
import {fromSerializedActivity} from "@/model/activity/serializer";
import {createActivity} from "@/model/activity/model";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {check, isNotDefined, isNotNull, isNull, type Maybe, type Nullable, takeIf} from "@/lib/utils";
import {useCalendarStore} from "@/stores/calendarStore";
import {useNotifyError} from "@/composables/useNotifyError";
import {migrateSerializedProject} from "@/model/project/migrations";
import {migrateSerializedActivity} from "@/model/activity/migrations";

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


  unsafeAddProject: (project: ReactiveProject) => void
  unsafeAddActivity: (activity: ReactiveActivity) => void
  unsafeRemoveProject: (project: ReactiveProject) => void
  unsafeRemoveActivity: (activity: ReactiveActivity) => void
}

interface ProjectsStorageSerialized {
  version: number
  projects: SerializedProject[]
  activities: SerializedActivity[]
}

export const useProjectsStore = defineStore('projects', (): ProjectsStore => {
  const calendarStore = useCalendarStore()
  const storage = useLocalStorage<ProjectsStorageSerialized>('time-companion-projects-store', { version: 0, projects: [], activities: [] })

  const isInitialized = ref(false)

  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function init() {
    if (isInitialized.value) {
      return
    }

    try {
      const serialized = storage.get()

      addProjects(serialized.projects.map((it: any) => createProject(fromSerializedProject(migrateSerializedProject(it, serialized.version ?? 0)))))
      addActivities(serialized.activities.map((it: any) => createActivity(fromSerializedActivity(migrateSerializedActivity(it, serialized.version ?? 0), { projects }))))

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
      version: 1,
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    })
  }

  watch([() => projects, () => activities], commit, {deep: true})

  /**
   * @deprecated
   */
  function getProjectIndexById(id: Maybe<ReactiveProject['id']>) {
    const index = projects.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  /**
   * @deprecated
   */
  function getProjectById(id: Maybe<ReactiveProject['id']>) {
    const index = getProjectIndexById(id)
    return takeIf(index, isNotNull, projects[index!])
  }

  /**
   * @deprecated
   */
  function getActivityIndexById(id: Maybe<ReactiveActivity['id']>) {
    const index = activities.findIndex((it) => it.id === id)

    if (index === -1) {
      return null
    }

    return index
  }

  /**
   * @deprecated
   */
  function getActivityById(id: Maybe<ReactiveActivity['id']>) {
    const index = getActivityIndexById(id)
    return takeIf(index, isNotNull, activities[index!])
  }

  /**
   * @deprecated
   */
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

  /**
   * @deprecated
   */
  function addProjects(projects: ReactiveProject[]) {
    projects.forEach((it) => addProject(it))
  }

  /**
   * @deprecated
   */
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

  /**
   * @deprecated
   */
  function addActivities(activities: ReactiveActivity[]) {
    activities.forEach((it) => addActivity(it))
  }

  /**
   * @deprecated
   */
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

  /**
   * @deprecated
   */
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

  /**
   * @deprecated
   */
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

  /**
   * @deprecated
   */
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

  function unsafeAddProject(project: ReactiveProject) {
    projects.push(project)
  }

  function unsafeAddActivity(activity: ReactiveActivity) {
    activities.push(activity)
  }

  function unsafeRemoveProject(project: ReactiveProject) {
    const index = projects.indexOf(project)

    check(index !== -1, `Failed to remove project "${project.id}": Project does not exist in store.`)

    projects.splice(index, 1)
  }

  function unsafeRemoveActivity(activity: ReactiveActivity) {
    const index = activities.indexOf(activity)

    check(index !== -1, `Failed to remove activity "${activity.id}": Activity does not exist in store.`)

    activities.splice(index, 1)
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
    unsafeAddProject,
    unsafeAddActivity,
    unsafeRemoveProject,
    unsafeRemoveActivity,
  }
})