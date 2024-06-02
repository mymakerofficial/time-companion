import type {
  ColumnBuilder,
  ColumnBuilderFactory,
  ColumnDefinitionRaw,
  MagicColumnBuilder,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import { ColumnDefinitionImpl } from '@shared/database/schema/columnDefinition'

class ColumnBuilderImpl<TColumn = unknown, TRow extends object = object>
  extends ColumnDefinitionImpl<TRow, TColumn>
  implements ColumnBuilder<TColumn, TRow>
{
  constructor(
    partialDefinition: Partial<ColumnDefinitionRaw<object, TColumn>> = {},
    protected readonly reporter?: (definition: ColumnDefinitionRaw) => void,
  ) {
    super({
      tableName: null,
      columnName: null,
      dataType: null,
      isPrimaryKey: false,
      isNullable: false,
      isIndexed: false,
      isUnique: false,
      ...partialDefinition,
    })
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

export class ColumnBuilderFactoryImpl<TRow extends object = object>
  extends ColumnDefinitionImpl<TRow>
  implements ColumnBuilderFactory<TRow>
{
  constructor(
    partialDefinition: Partial<ColumnDefinitionRaw<TRow, any>> = {},
    protected readonly reporter?: (definition: ColumnDefinitionRaw) => void,
  ) {
    super({
      tableName: null,
      columnName: null,
      dataType: null,
      isPrimaryKey: false,
      isNullable: false,
      isIndexed: false,
      isUnique: false,
      ...partialDefinition,
    })
  }

  named(columnName: string) {
    return new ColumnBuilderFactoryImpl({ columnName }, this.reporter)
  }

  string() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'string',
      },
      this.reporter,
    ) as ColumnBuilder<string>
  }

  number() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'number',
      },
      this.reporter,
    ) as ColumnBuilder<number>
  }

  boolean() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'boolean',
      },
      this.reporter,
    ) as ColumnBuilder<boolean>
  }

  uuid() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'uuid',
      },
      this.reporter,
    ) as ColumnBuilder<string>
  }

  double() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'double',
      },
      this.reporter,
    ) as ColumnBuilder<number>
  }

  integer() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'integer',
      },
      this.reporter,
    ) as ColumnBuilder<number>
  }

  json<T extends object = object>() {
    return new ColumnBuilderImpl(
      {
        ...this.definition,
        dataType: 'json',
      },
      this.reporter,
    ) as ColumnBuilder<T>
  }
}

function createMagicColumnBuilder() {
  const builder = new ColumnBuilderFactoryImpl() as ColumnBuilderFactory

  const c = (columnOrTableName: string, columnName?: string) => {
    return new ColumnBuilderFactoryImpl({
      tableName: columnName ? columnOrTableName : null,
      columnName: columnName || columnOrTableName,
    }) as ColumnBuilderFactory
  }

  Object.assign(c, {
    string: builder.string,
    number: builder.number,
    boolean: builder.boolean,
    uuid: builder.uuid,
    double: builder.double,
    integer: builder.integer,
    json: builder.json,
  })

  return c as MagicColumnBuilder
}

export const c = createMagicColumnBuilder()

export const t = new ColumnBuilderFactoryImpl() as ColumnBuilderFactory

export const string = t.string
export const number = t.number
export const boolean = t.boolean
export const uuid = t.uuid
export const double = t.double
export const integer = t.integer
export const json = t.json
