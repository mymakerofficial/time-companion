import {useProjectsStore} from "@/stores/projectsStore";
import {computed, reactive, toValue} from "vue";
import type {ReactiveProject} from "@/model/project/types";
import type {ReactiveActivity} from "@/model/activity/types";
import {check, isNotNull, type Nullable} from "@/lib/utils";
import {whereDisplayName, whereId} from "@/lib/listUtils";
import {mapReadonly} from "@/model/modelHelpers";
import {useCalendarService} from "@/services/calendarService";
import {migrateSerializedProject} from "@/model/project/migrations";
import {fromSerializedProject} from "@/model/project/serializer";
import {createProject} from "@/model/project/model";
import {migrateSerializedActivity} from "@/model/activity/migrations";
import {createActivity} from "@/model/activity/model";
import {fromSerializedActivity} from "@/model/activity/serializer";
import {createService} from "@/composables/createService";
import {useInitialize} from "@/composables/useInitialize";

export interface ProjectsService {
  projects: ReadonlyArray<ReactiveProject>
  activities: ReadonlyArray<ReactiveActivity>
  breakProject: Nullable<ReactiveProject>
  init: () => void
  addProject: (project: ReactiveProject) => void
  addProjects: (projects: ReactiveProject[]) => void
  removeProject: (project: ReactiveProject) => void
  removeProjects: (projects: ReactiveProject[]) => void
  addActivity: (activity: ReactiveActivity) => void
  addActivities: (activities: ReactiveActivity[]) => void
  removeActivity: (activity: ReactiveActivity) => void
  removeActivities: (activities: ReactiveActivity[]) => void
  unlink: (project: ReactiveProject, activity: ReactiveActivity) => void
  link: (project: ReactiveProject, activity: ReactiveActivity) => void
}

export const useProjectsService = createService<ProjectsService>(() => {
  const projectsStore = useProjectsStore()
  const calendarService = useCalendarService()

  const { init } = useInitialize(() => {
    const serialized = projectsStore.getSerializedStorage()

    const version = serialized.version ?? 0

    const projects = serialized.projects
      .map((it) => migrateSerializedProject(it, version))
      .map((it) => createProject(fromSerializedProject(it)))

    const activities = serialized.activities
      .map((it) => migrateSerializedActivity(it, version))
      .map((it) => createActivity(fromSerializedActivity(it, { projects })))

    addProjects(projects)
    addActivities(activities)
  })

  function setBreakProject(newProject: Nullable<ReactiveProject>) {
    const oldProject = breakProject.value

    // TODO for some reason the project properties are refs here???
    check(!toValue(newProject?.isBillable),
      `Failed to set break project: Project with id "${toValue(newProject?.id)}" is billable.`
    )

    if (isNotNull(oldProject)) {
      oldProject.unsafeSetIsBreak(false)
    }

    if (isNotNull(newProject)) {
      newProject.unsafeSetIsBreak(true)
    }
  }

  const breakProject = computed({
    get() {
      return projectsStore.projects.find((it) => it.isBreak) ?? null
    },
    set: setBreakProject
  })

  function addProject(project: ReactiveProject) {
    check(!projectsStore.projects.some(whereId(project.id)),
      `Failed to add project: Project with id "${project.id}" already exists.`
    )
    check(!projectsStore.projects.some(whereDisplayName(project.displayName)),
      `Failed to add project: Project with displayName "${project.displayName}" already exists.`
    )

    projectsStore.unsafeAddProject(project)

    // the project might have child activities but the activities might not have the project set as parent
    // make sure referential integrity is maintained
    project.childActivities.forEach((activity) => {
      link(project, activity)
    })
  }

  function addProjects(projects: ReactiveProject[]) {
    projects.forEach(addProject)
  }

  function removeProject(project: ReactiveProject) {
    check(projectsStore.projects.includes(project),
      `Failed to remove project "${project.id}": Project not found.`
    )

    // remove all child activities
    project.childActivities.forEach((activity) => {
      removeActivity(activity)
    })

    // remove project from all events
    calendarService.forEachEvent((event) => {
      if (event.project === project) {
        event.project = null
      }
    })

    projectsStore.unsafeRemoveProject(project)
  }

  function removeProjects(projects: ReactiveProject[]) {
    projects.forEach(removeProject)
  }

  function addActivity(activity: ReactiveActivity) {
    check(!projectsStore.activities.some(whereId(activity.id)),
      `Failed to add activity: Activity with id "${activity.id}" already exists.`
    )
    check(!projectsStore.activities.some((it) => it.displayName === activity.displayName && it.parentProject === activity.parentProject),
      `Failed to add activity: Activity with displayName "${activity.displayName}" and same parentProject already exists.`
    )

    projectsStore.unsafeAddActivity(activity)

    // the activity might have a parent project but the project might not have the activity set as a child
    // make sure referential integrity is maintained
    if (isNotNull(activity.parentProject)) {
      link(activity.parentProject, activity)
    }
  }

  function addActivities(activities: ReactiveActivity[]) {
    activities.forEach(addActivity)
  }

  function removeActivity(activity: ReactiveActivity) {
    check(projectsStore.activities.includes(activity),
      `Failed to remove activity "${activity.id}": Activity not found.`
    )

    // if the activity has a parent project, remove it from the project
    if (isNotNull(activity.parentProject)) {
      activity.parentProject.unsafeRemoveChildActivity(activity)
    }

    // remove activity from all events
    calendarService.forEachEvent((event) => {
      if (event.activity === activity) {
        event.activity = null
      }
    })

    projectsStore.unsafeRemoveActivity(activity)
  }

  function removeActivities(activities: ReactiveActivity[]) {
    activities.forEach(removeActivity)
  }

  function unlink(project: ReactiveProject, activity: ReactiveActivity) {
    project.unsafeRemoveChildActivity(activity)
    activity.unsafeSetParentProject(null)
  }

  function link(project: ReactiveProject, activity: ReactiveActivity) {
    if (project.childActivities.some(whereId(activity.id))) {
      // activity is already a child of the project, nothing to do
      return
    }

    if (
      isNotNull(activity.parentProject) &&
      activity.parentProject !== project
    ) {
      // activity is already a child of another project, unlink it first
      unlink(activity.parentProject, activity)
    }

    project.unsafeAddChildActivity(activity)
    activity.unsafeSetParentProject(project)

    // update project of all events with this activity
    calendarService.forEachEvent((event) => {
      if (event.activity === activity) {
        event.project = project
      }
    })
  }

  return reactive({
    ...mapReadonly(projectsStore, [
      'projects',
      'activities'
    ]),
    breakProject,
    init,
    addProject,
    addProjects,
    removeProject,
    removeProjects,
    addActivity,
    addActivities,
    removeActivity,
    removeActivities,
    unlink,
    link
  })
})