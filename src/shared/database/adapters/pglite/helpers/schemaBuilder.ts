import type { Knex } from 'knex'
import type {
  AlterColumnAction,
  AlterTableAction,
  AlterTableRenameTableAction,
  ColumnDefinitionRaw,
  TableSchemaRaw,
} from '@shared/database/types/schema'
import { genericTypeToPgType } from '@shared/database/adapters/pglite/helpers/genericTypeToPgType'
import { valuesOf } from '@shared/lib/utils/object'
import type { Optional } from '@shared/lib/utils/types'
import { check, isDefined, isNotNull } from '@shared/lib/utils/checks'

export function buildCreateTable(knex: Knex, schema: TableSchemaRaw) {
  return knex.schema.createTable(schema.tableName, (tableBuilder) => {
    valuesOf(schema.columns).forEach((column) => {
      buildColumn(tableBuilder, column)
    })
  })
}

export function buildAlterTable(
  knex: Knex,
  tableName: string,
  actions: Array<AlterTableAction>,
) {
  const builder = knex.schema

  builder.alterTable(tableName, (tableBuilder) => {
    for (const action of actions) {
      switch (action.type) {
        case 'addColumn':
          buildColumn(tableBuilder, action.definition)
          break
        case 'alterColumn':
          buildAlterColumn(tableBuilder, action.columnName, action.action)
          break
        case 'dropColumn':
          tableBuilder.dropColumn(action.columnName)
          break
        case 'renameColumn':
          tableBuilder.renameColumn(action.columnName, action.newColumnName)
          break
      }
    }
  })

  const renameTableAction = actions.find(
    (action) => action.type === 'renameTable',
  ) as Optional<AlterTableRenameTableAction>

  if (isDefined(renameTableAction)) {
    builder.renameTable(tableName, renameTableAction.newTableName)
  }

  return builder
}

function buildAlterColumn(
  tableBuilder: Knex.AlterTableBuilder,
  columnName: string,
  action: AlterColumnAction,
) {
  switch (action.type) {
    case 'setDataType':
      tableBuilder
        .specificType(columnName, genericTypeToPgType(action.dataType))
        .alter({ alterNullable: false })
      break
    case 'setNullable':
      if (action.nullable) {
        tableBuilder.setNullable(columnName)
      } else {
        tableBuilder.dropNullable(columnName)
      }
      break
    case 'setIndexed':
      if (action.indexed) {
        tableBuilder.index(columnName)
      } else {
        tableBuilder.dropIndex(columnName)
      }
      break
    case 'setUnique':
      if (action.unique) {
        tableBuilder.unique(columnName)
      } else {
        tableBuilder.dropUnique([columnName])
      }
      break
  }

  return tableBuilder
}

function buildColumn(
  tableBuilder: Knex.CreateTableBuilder,
  columnDefinition: ColumnDefinitionRaw,
) {
  check(
    isNotNull(columnDefinition.columnName),
    'Column must have a column name to be created',
  )

  check(
    isNotNull(columnDefinition.dataType),
    'Column must have a data type to be created',
  )

  const columnBuilder = tableBuilder.specificType(
    columnDefinition.columnName,
    genericTypeToPgType(columnDefinition.dataType),
  )

  if (columnDefinition.isPrimaryKey) {
    columnBuilder.primary()
  }

  if (columnDefinition.isNullable) {
    columnBuilder.nullable()
  } else {
    columnBuilder.notNullable()
  }

  if (columnDefinition.isIndexed) {
    columnBuilder.index()
  }

  if (columnDefinition.isUnique) {
    columnBuilder.unique()
  }

  return columnDefinition
}
