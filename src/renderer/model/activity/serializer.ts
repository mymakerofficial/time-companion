import type {
  ActivityContext,
  ActivityDeserializationAssets,
  ActivityInit,
  SerializedActivity,
} from '@renderer/model/activity/types'
import { whereId } from '@renderer/lib/listUtils'
import { formatDateTime, parseDateTime } from '@renderer/lib/neoTime'

export function fromSerializedActivity(
  serialized: SerializedActivity,
  assets: ActivityDeserializationAssets,
): ActivityInit {
  return {
    id: serialized.id,
    displayName: serialized.displayName,
    color: serialized.color,
    parentProject:
      assets.projects.find(whereId(serialized.parentProjectId)) ?? null,
    lastUsed: parseDateTime(serialized.lastUsed),
  }
}

export function serializeActivity(
  activity: ActivityContext,
): SerializedActivity {
  return {
    id: activity.id,
    displayName: activity.displayName,
    color: activity.color,
    parentProjectId: activity.parentProject?.id ?? null,
    lastUsed: formatDateTime(activity.lastUsed),
  }
}
