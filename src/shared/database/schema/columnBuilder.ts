import { type ColumnType } from '@shared/database/types/database'
import type {
  ColumnBuilder,
  ColumnBuilderFactory,
  ColumnDefinitionRaw,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'

class ColumnBuilderImpl<TColumn> implements ColumnBuilder<TColumn> {
  protected definition: ColumnDefinitionRaw<object, TColumn>

  constructor(
    dataType: ColumnType = 'string',
    protected readonly columnName: string = '',
    protected readonly reporter?: (definition: ColumnDefinitionRaw) => void,
  ) {
    this.definition = {
      tableName: '',
      columnName,
      dataType,
      isPrimaryKey: false,
      isNullable: false,
      isIndexed: false,
      isUnique: false,
    }
    this.report()
  }

  protected report() {
    if (this.reporter) {
      this.reporter(this.definition)
    }
  }

  get _() {
    return {
      raw: this.definition,
    }
  }

  primaryKey() {
    this.definition.isPrimaryKey = true
    this.report()
    return this as ColumnBuilder<TColumn>
  }

  nullable() {
    this.definition.isNullable = true
    this.report()
    return this as ColumnBuilder<Nullable<TColumn>>
  }

  indexed() {
    this.definition.isIndexed = true
    this.report()
    return this as ColumnBuilder<TColumn>
  }

  unique() {
    this.definition.isUnique = true
    this.report()
    return this as ColumnBuilder<TColumn>
  }
}

export class ColumnBuilderFactoryImpl implements ColumnBuilderFactory {
  constructor(
    protected readonly columnName?: string,
    protected readonly reporter?: (definition: ColumnDefinitionRaw) => void,
  ) {}

  string() {
    return new ColumnBuilderImpl(
      'string',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<string>
  }

  number() {
    return new ColumnBuilderImpl(
      'number',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<number>
  }

  boolean() {
    return new ColumnBuilderImpl(
      'boolean',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<boolean>
  }

  uuid() {
    return new ColumnBuilderImpl(
      'uuid',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<string>
  }

  double() {
    return new ColumnBuilderImpl(
      'double',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<number>
  }

  integer() {
    return new ColumnBuilderImpl(
      'integer',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<number>
  }

  json<T extends object = object>() {
    return new ColumnBuilderImpl(
      'json',
      this.columnName,
      this.reporter,
    ) as ColumnBuilder<T>
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
