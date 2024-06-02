import { check } from '@shared/lib/utils/checks'
import {
  DatabaseDuplicateTableError,
  DatabaseNotNullViolationError,
  DatabaseUndefinedColumnError,
  DatabaseUndefinedTableError,
  DatabaseUniqueViolationError,
} from '@shared/database/types/errors'

export interface PGliteDatabaseError extends Error {
  readonly length: number
  readonly name: string
  severity: string | undefined
  code: string | undefined
  detail: string | undefined
  hint: string | undefined
  position: string | undefined
  internalPosition: string | undefined
  internalQuery: string | undefined
  where: string | undefined
  schema: string | undefined
  table: string | undefined
  column: string | undefined
  dataType: string | undefined
  constraint: string | undefined
  file: string | undefined
  line: string | undefined
  routine: string | undefined
}

export function isPGliteDatabaseError(
  error: unknown,
): error is PGliteDatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'code' in error &&
    'message' in error &&
    'stack' in error
  )
}

export function handlePGliteError(error: unknown): never {
  check(isPGliteDatabaseError(error), error as Error)

  if (error.code === '42P01') {
    const [, tableName] = error.message.split('"')

    throw new DatabaseUndefinedTableError(tableName)
  }

  if (error.code === '42703') {
    const [, columnName, , tableName] = error.message.split('"')

    throw new DatabaseUndefinedColumnError(tableName, columnName)
  }

  if (error.code === '23505') {
    const tableName = error.table ?? ''
    const [, columnName = '', , value = ''] = error.detail?.split(/[()]/) ?? []

    throw new DatabaseUniqueViolationError(tableName, columnName, value)
  }

  if (error.code === '42P07') {
    const [, tableName] = error.message.split('"')

    throw new DatabaseDuplicateTableError(tableName)
  }

  if (error.code === '23502') {
    throw new DatabaseNotNullViolationError(
      error.table ?? '',
      error.column ?? '',
    )
  }

  throw error
}
