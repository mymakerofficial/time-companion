import type {SerializedProject} from "@/model/project/types";
import {defineMigrator} from "@/lib/migrations";

function upgradeVersion0(original: any): any {
  return {
    id: original.id,
    displayName: original.displayName,
    color: original.color,
    isBillable: original.isBillable,
    lastUsed: original.lastUsed.split('.', 1)[0],
    childActivityIds: original.childActivityIds,
  }
}

export const migrateSerializedProject = defineMigrator<SerializedProject>([
  upgradeVersion0,
])