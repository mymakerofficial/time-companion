import type {ActivityContext, ActivityDeserializationAssets, ActivityInit, SerializedActivity} from "@/model/activity/types";
import {whereId} from "@/lib/listUtils";
import {formatDateTime, parseDateTime} from "@/lib/neoTime";

export function fromSerializedActivity(serialized: SerializedActivity, assets: ActivityDeserializationAssets): ActivityInit {
  return {
    id: serialized.id,
    displayName: serialized.displayName,
    color: serialized.color,
    parentProject: assets.projects.find(whereId(serialized.parentProjectId)) ?? null,
    lastUsed: parseDateTime(serialized.LastUsed),
  }
}

export function serializeActivity(activity: ActivityContext): SerializedActivity {
  return {
    id: activity.id,
    displayName: activity.displayName,
    color: activity.color,
    parentProjectId: activity.parentProject?.id ?? null,
    LastUsed: formatDateTime(activity.lastUsed),
  }
}