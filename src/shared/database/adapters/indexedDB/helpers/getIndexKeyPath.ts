import type { ColumnDefinitionRaw } from '@shared/database/types/schema'

export function getIndexKeyPath(column: ColumnDefinitionRaw): string {
  if (column.dataType === 'time' || column.dataType === 'interval') {
    return `${column.columnName}.totalSeconds`
  }

  return `${column.columnName}`
}
