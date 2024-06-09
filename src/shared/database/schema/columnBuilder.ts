import type {
  ColumnBuilder,
  ColumnBuilderFactory,
  ColumnDefinitionRaw,
  MagicColumnBuilder,
} from '@shared/database/types/schema'
import type { Nullable } from '@shared/lib/utils/types'
import { ColumnDefinitionImpl } from '@shared/database/schema/columnDefinition'
import { assignProperties } from '@shared/lib/utils/object'
import type { ColumnType } from '@shared/database/types/database'

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

  private setType<TColumn>(dataType: ColumnType) {
    return new ColumnBuilderImpl<TColumn, TRow>(
      {
        ...this.definition,
        dataType,
      },
      this.reporter,
    ) as ColumnBuilder<TColumn, TRow>
  }

  text() {
    return this.setType<string>('text')
  }

  string() {
    return this.text()
  }

  integer() {
    return this.setType<number>('integer')
  }

  double() {
    return this.setType<number>('double')
  }

  number() {
    return this.double()
  }

  boolean() {
    return this.setType<boolean>('boolean')
  }

  datetime() {
    return this.setType<Date>('datetime')
  }

  date() {
    return this.setType<Date>('date')
  }

  time() {
    return this.setType<string>('time')
  }

  interval() {
    return this.setType<string>('interval')
  }

  uuid() {
    return this.setType<string>('uuid')
  }

  json<T extends object = object>() {
    return this.setType<T>('json')
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

  return assignProperties(c, builder) as MagicColumnBuilder
}

export const c = createMagicColumnBuilder()
