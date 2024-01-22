import type {Nullable} from "@/lib/utils";

export interface ProjectRow {
  id: string
  name: string[]
  isBillable: Nullable<boolean>
  color: Nullable<string>
  lastUsed: string
  activities?: ProjectRow[]
  isProject: boolean
}
