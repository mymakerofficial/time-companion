import type {
  ProjectContext,
  ProjectInit,
  SerializedProject,
} from '@renderer/model/project/types'
import { formatDateTime, parseDateTime } from '@renderer/lib/neoTime'

export function fromSerializedProject(
  serialized: SerializedProject,
): ProjectInit {
  return {
    id: serialized.id,
    childActivities: [], // will be filled by activity deserialization
    displayName: serialized.displayName,
    color: serialized.color,
    isBillable: serialized.isBillable,
    isBreak: serialized.isBreak,
    lastUsed: parseDateTime(serialized.lastUsed),
  }
}

export function serializeProject(project: ProjectContext): SerializedProject {
  return {
    id: project.id,
    childActivityIds: project.childActivities.map((it) => it.id),
    displayName: project.displayName,
    color: project.color,
    isBillable: project.isBillable,
    isBreak: project.isBreak,
    lastUsed: formatDateTime(project.lastUsed),
  }
}
