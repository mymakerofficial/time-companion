import { type ColumnType, columnTypes } from '@shared/database/types/database'
import type {
  DatabaseColumnDefinitionBuilder,
  DatabaseColumnDefinitionRaw,
} from '@shared/database/types/schema'

function createColumnBuilder(
  definition: DatabaseColumnDefinitionRaw<unknown> = {
    name: '',
    type: 'string',
    isPrimaryKey: false,
    isNullable: false,
  },
  base: DatabaseColumnDefinitionBuilder<unknown> | object = {},
): DatabaseColumnDefinitionBuilder<unknown> {
  return new Proxy(base, {
    get(target, prop: keyof DatabaseColumnDefinitionBuilder<unknown>) {
      if (prop === 'getRaw') {
        return () => definition
      }

      if (prop === 'primaryKey') {
        return () => createColumnBuilder({ ...definition, isPrimaryKey: true })
      }

      if (prop === 'nullable') {
        return () => createColumnBuilder({ ...definition, isNullable: true })
      }

      if (columnTypes.includes(prop)) {
        return () =>
          createColumnBuilder({ ...definition, type: prop as ColumnType })
      }

      return Reflect.get(target, prop)
    },
  }) as DatabaseColumnDefinitionBuilder<unknown>
}

export const t = createColumnBuilder()
