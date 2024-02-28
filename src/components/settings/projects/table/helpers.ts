import type {ReactiveActivity} from "@/model/activity/types";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import type {ReactiveProject} from "@/model/project/types";
import {createEventShadow} from "@/model/eventShadow/model";

function toActivityRow(activity: ReactiveActivity): ProjectRow {
  return {
    id: activity.id,
    shadow: createEventShadow({
      project: activity.parentProject!,
      activity
    }),
    isBillable: null,
    color: activity.color,
    lastUsed: activity.lastUsed,
    activities: [],
    parentProjectId: activity.parentProject?.id ?? null,
    isProject: false,
  }
}

export function toProjectRow(project: ReactiveProject): ProjectRow {
  return {
    id: project.id,
    shadow: createEventShadow({
      project
    }),
    isBillable: project.isBillable,
    color: project.color,
    lastUsed: project.lastUsed,
    activities: project.childActivities.map(toActivityRow),
    parentProjectId: null,
    isProject: true,
  }
}