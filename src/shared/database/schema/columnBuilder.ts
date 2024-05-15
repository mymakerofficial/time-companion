import { type ColumnType } from '@shared/database/types/database'
import type {
  ColumnBuilder,
  ColumnBuilderFactory,
  ColumnDefinitionRaw,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'

class ColumnBuilderImpl<TColumn> implements ColumnBuilder<TColumn> {
  protected definition: ColumnDefinitionRaw<TColumn>

  constructor(dataType: ColumnType = 'string') {
    this.definition = {
      tableName: '',
      columnName: '',
      dataType,
      isPrimaryKey: false,
      isNullable: false,
      isIndexed: false,
      isUnique: false,
    }
  }

  get _() {
    return {
      raw: this.definition,
    }
  }

  primaryKey() {
    this.definition.isPrimaryKey = true
    return this as ColumnBuilder<TColumn>
  }

  nullable() {
    this.definition.isNullable = true
    return this as ColumnBuilder<Nullable<TColumn>>
  }

  indexed() {
    this.definition.isIndexed = true
    return this as ColumnBuilder<TColumn>
  }

  unique() {
    this.definition.isUnique = true
    return this as ColumnBuilder<TColumn>
  }
}

class ColumnBuilderFactoryImpl implements ColumnBuilderFactory {
  string() {
    return new ColumnBuilderImpl('string') as ColumnBuilder<string>
  }

  number() {
    return new ColumnBuilderImpl('number') as ColumnBuilder<number>
  }

  boolean() {
    return new ColumnBuilderImpl('boolean') as ColumnBuilder<boolean>
  }
}

export const t = new ColumnBuilderFactoryImpl() as ColumnBuilderFactory

export const string = t.string
export const number = t.number
export const boolean = t.boolean
