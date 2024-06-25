import type {
  AlterColumnAction,
  AlterColumnBuilder,
  AlterTableAction,
  AlterTableBuilder,
  ColumnBuilderFactory,
} from '@database/types/schema'
import { ColumnBuilderFactoryImpl } from '@database/schema/columnBuilder'
import type { ColumnType } from '@database/types/database'

export class AlterTableBuilderImpl implements AlterTableBuilder {
  protected _actions: Array<AlterTableAction> = []

  get _() {
    return {
      actions: this._actions,
    }
  }

  addColumn(columnName: string): ColumnBuilderFactory {
    return new ColumnBuilderFactoryImpl({ columnName }, (definition) => {
      // remove previous addColumn action for this column if exists
      this._actions = this._actions.filter(
        (action) =>
          action.type !== 'addColumn' ||
          action.definition.columnName !== columnName,
      )
      // add newest addColumn action
      this._actions.push({ type: 'addColumn', definition })
    })
  }

  alterColumn(columnName: string): AlterColumnBuilder {
    return new AlterColumnBuilderImpl(columnName, (action) => {
      this._actions.push({ type: 'alterColumn', columnName, action })
    })
  }

  dropColumn(columnName: string): void {
    this._actions.push({ type: 'dropColumn', columnName })
  }

  renameColumn(columnName: string, newColumnName: string): void {
    this._actions.push({ type: 'renameColumn', columnName, newColumnName })
  }

  renameTo(newTableName: string): void {
    this._actions.push({ type: 'renameTable', newTableName })
  }
}

export class AlterColumnBuilderImpl implements AlterColumnBuilder {
  constructor(
    protected readonly columnName?: string,
    protected readonly reporter?: (action: AlterColumnAction) => void,
  ) {}

  protected report(action: AlterColumnAction) {
    if (this.reporter) {
      this.reporter(action)
    }
  }

  setDataType(dataType: ColumnType): AlterColumnBuilder {
    const action: AlterColumnAction = { type: 'setDataType', dataType }
    this.report(action)
    return this
  }

  setNullable(nullable = true): AlterColumnBuilder {
    const action: AlterColumnAction = { type: 'setNullable', nullable }
    this.report(action)
    return this
  }

  dropNullable(): AlterColumnBuilder {
    return this.setNullable(false)
  }

  setIndexed(indexed = true): AlterColumnBuilder {
    const action: AlterColumnAction = { type: 'setIndexed', indexed }
    this.report(action)
    return this
  }

  dropIndexed(): AlterColumnBuilder {
    return this.setIndexed(false)
  }

  setUnique(unique = true): AlterColumnBuilder {
    const action: AlterColumnAction = { type: 'setUnique', unique }
    this.report(action)
    return this
  }

  dropUnique(): AlterColumnBuilder {
    return this.setUnique(false)
  }
}
