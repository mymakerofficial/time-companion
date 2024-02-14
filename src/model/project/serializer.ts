import type {ProjectInit, SerializedProject} from "@/model/project/";
import type {ProjectContext} from "@/model/project/";
import {formatDateTime, parseDateTime} from "@/lib/neoTime";

export function fromSerializedProject(serialized: SerializedProject): ProjectInit {
  return {
    id: serialized.id,
    childActivities: [], // will be filled by activity deserialization
    displayName: serialized.displayName,
    color: serialized.color,
    isBillable: serialized.isBillable,
    lastUsed: parseDateTime(serialized.lastUsed),
  }
}

export function serializeProject(project: ProjectContext): SerializedProject {
  return {
    id: project.id,
    childActivityIds: project.childActivities.map(it => it.id),
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    lastUsed: formatDateTime(project.lastUsed),
  }
}