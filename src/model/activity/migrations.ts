import type {SerializedActivity} from "@/model/activity/types";
import {defineMigrator} from "@/lib/migrations";

function upgradeVersion0(original: any): any {
  return {
    id: original.id,
    displayName: original.displayName,
    color: original.color,
    lastUsed: original.LastUsed?.split('.', 1)[0] ?? original.lastUsed?.split('.', 1)[0], // i guess at some point it was uppercased
    parentProjectId: original.parentProjectId,
  }
}

export const migrateSerializedActivity = defineMigrator<SerializedActivity>([
  upgradeVersion0,
])