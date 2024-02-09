import type {ReactiveActivity} from "@/model/activity";
import type {ProjectRow} from "@/components/settings/projects/table/types";
import {isDefined} from "@/lib/utils";
import type {ReactiveProject} from "@/model/project";
import {createEventShadow} from "@/model/calendarEventShadow";

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
    isProject: true,
  }
}