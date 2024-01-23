import type {ReactiveActivity} from "@/model/activity";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {isDefined} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";

function toActivityRow(activity: ReactiveActivity): ProjectRow {
  return {
    id: activity.id,
    name: [activity.parentProject?.displayName, activity.displayName].filter(isDefined),
    isBillable: null,
    color: activity.color,
    lastUsed: activity.lastUsed,
    isProject: false,
  }
}

export function toProjectRow(project: ReactiveProject): ProjectRow {
  return {
    id: project.id,
    name: [project.displayName],
    isBillable: project.isBillable,
    color: project.color,
    lastUsed: project.lastUsed,
    activities: project.childActivities.map(toActivityRow),
    isProject: true,
  }
}