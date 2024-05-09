import { type ColumnType } from '@shared/database/types/database'
import type {
  ColumnBuilder,
  ColumnDefinitionRaw,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'

class ColumnBuilderImpl<T> implements ColumnBuilder<T> {
  protected definition: ColumnDefinitionRaw<T>

  constructor(dataType: ColumnType = 'string') {
    this.definition = {
      tableName: '',
      columnName: '',
      dataType,
      isPrimaryKey: false,
      isNullable: false,
    }
  }

  get _() {
    return {
      raw: this.definition,
    }
  }

  primaryKey() {
    this.definition.isPrimaryKey = true
    return this as ColumnBuilder<T>
  }

  nullable() {
    this.definition.isNullable = true
    return this as ColumnBuilder<Nullable<T>>
  }
}

export const t = {
  string: () => new ColumnBuilderImpl('string') as ColumnBuilder<string>,
  number: () => new ColumnBuilderImpl('number') as ColumnBuilder<number>,
  boolean: () => new ColumnBuilderImpl('boolean') as ColumnBuilder<boolean>,
}

export const string = t.string
export const number = t.number
export const boolean = t.boolean
