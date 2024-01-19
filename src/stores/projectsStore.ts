import {defineStore} from "pinia";
import {reactive, readonly, type Ref, ref, watch} from "vue";
import type {ReactiveProject, SerializedProject} from "@/model/project";
import type {ReactiveActivity, SerializedActivity} from "@/model/activity";
import {createProject, fromSerializedProject} from "@/model/project";
import {createActivity, fromSerializedActivity} from "@/model/activity";
import {useLocalStorage} from "@/composables/useLocalStorage";
import {isNotNull} from "@/lib/utils";
import {useCalendarStore} from "@/stores/calendarStore";

export interface ProjectsStore {
  isInitialized: Readonly<Ref<boolean>>
  projects: ReactiveProject[]
  activities: ReactiveActivity[]
  init: () => void
  addProject: (project: ReactiveProject) => void
  addActivity: (activity: ReactiveActivity) => void
  /**
   * Removes a project and all its child activities from the store. Also removes the project and child activities from all events in calendarStore.
   */
  removeProject: (project: ReactiveProject) => void
  /**
   * Removes an activity from the store and removes the activity from all events in calendarStore.
   */
  removeActivity: (activity: ReactiveActivity) => void
  link: (project: ReactiveProject, activity: ReactiveActivity) => void
  unlink: (project: ReactiveProject, activity: ReactiveActivity) => void
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

  function removeActivity(activity: ReactiveActivity) {
    if (!calendarStore.isInitialized) {
      throw new Error('Tried to remove activity before calendarStore was initialized. This should not happen.')
    }

    if (!isInitialized.value) {
      throw new Error('Tried to remove activity before projectsStore was initialized. This should not happen.')
    }

    if (!activities.some((it) => it.id === activity.id)) {
      throw new Error(`Activity with id ${activity.id} does not exist in projectsStore`)
    }

    if (isNotNull(activity.parentProject)) {
      unlink(activity.parentProject, activity)
    }

    calendarStore.days.forEach((day) => {
      day.events.forEach((event) => {
        if (event.activity?.id === activity.id) {
          event.activity = null
        }
      })
    })

    const index = activities.findIndex((it) => it.id === activity.id)

    if (index === -1) {
      throw new Error(`Something went wrong while removing activity ${activity.id} from projectsStore`)
    }
  }

  function removeProject(project: ReactiveProject) {
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

    calendarStore.days.forEach((day) => {
      day.events.forEach((event) => {
        if (event.project?.id === project.id) {
          console.log(`Removing project ${project.id} from event ${event.id}`)
          event.project = null
        }
      })
    })

    const index = projects.findIndex((it) => it.id === project.id)

    if (index === -1) {
      throw new Error(`Something went wrong while removing project ${project.id} from projectsStore`)
    }

    projects.splice(index, 1)
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
    isInitialized: readonly(isInitialized),
    projects,
    activities,
    init,
    addProject,
    addActivity,
    removeProject,
    removeActivity,
    link,
    unlink,
  }
})