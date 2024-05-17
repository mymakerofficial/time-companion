import { type ColumnType } from '@shared/database/types/database'
import type {
  ColumnBuilder,
  ColumnBuilderFactory,
  ColumnDefinitionRaw,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'

class ColumnBuilderImpl<TColumn> implements ColumnBuilder<TColumn> {
  protected definition: ColumnDefinitionRaw<object, TColumn>

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

  uuid() {
    return new ColumnBuilderImpl('uuid') as ColumnBuilder<string>
  }

  double() {
    return new ColumnBuilderImpl('double') as ColumnBuilder<number>
  }

  integer() {
    return new ColumnBuilderImpl('integer') as ColumnBuilder<number>
  }

  json<T extends object = object>() {
    return new ColumnBuilderImpl('json') as ColumnBuilder<T>
  }
}

export const t = new ColumnBuilderFactoryImpl() as ColumnBuilderFactory

export const string = t.string
export const number = t.number
export const boolean = t.boolean
export const uuid = t.uuid
export const double = t.double
export const integer = t.integer
export const json = t.json
