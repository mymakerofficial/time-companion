import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import type {
  ReactiveProject,
  SerializedProject,
} from '@renderer/model/project/types'
import type {
  ReactiveActivity,
  SerializedActivity,
} from '@renderer/model/activity/types'
import { useLocalStorage } from '@renderer/composables/useLocalStorage'
import { check } from '@renderer/lib/utils'

export interface ProjectsStore {
  projects: ReadonlyArray<ReactiveProject>
  activities: ReadonlyArray<ReactiveActivity>
  getSerializedStorage: () => ProjectsStorageSerialized
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
  const storage = useLocalStorage<ProjectsStorageSerialized>(
    'time-companion-projects-store',
    { version: 0, projects: [], activities: [] },
  )

  const projects = reactive<ReactiveProject[]>([])
  const activities = reactive<ReactiveActivity[]>([])

  function commit() {
    storage.set({
      version: 2,
      projects: projects.map((it) => it.toSerialized()),
      activities: activities.map((it) => it.toSerialized()),
    })
  }

  watch([projects, activities], commit, { deep: true })

  function getSerializedStorage() {
    return storage.get()
  }

  function unsafeAddProject(project: ReactiveProject) {
    projects.push(project)
  }

  function unsafeAddActivity(activity: ReactiveActivity) {
    activities.push(activity)
  }

  function unsafeRemoveProject(project: ReactiveProject) {
    const index = projects.indexOf(project)

    check(
      index !== -1,
      `Failed to remove project "${project.id}": Project does not exist in store.`,
    )

    projects.splice(index, 1)
  }

  function unsafeRemoveActivity(activity: ReactiveActivity) {
    const index = activities.indexOf(activity)

    check(
      index !== -1,
      `Failed to remove activity "${activity.id}": Activity does not exist in store.`,
    )

    activities.splice(index, 1)
  }

  return {
    projects,
    activities,
    getSerializedStorage,
    unsafeAddProject,
    unsafeAddActivity,
    unsafeRemoveProject,
    unsafeRemoveActivity,
  }
})
