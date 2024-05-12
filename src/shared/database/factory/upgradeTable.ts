import type {
  CreateIndexArgs,
  UpgradeTable,
} from '@shared/database/types/database'
import { DatabaseTableImpl } from '@shared/database/factory/table'

export class DatabaseUpgradeTableImpl<TData extends object>
  extends DatabaseTableImpl<TData>
  implements UpgradeTable<TData> {
  // ...
}
