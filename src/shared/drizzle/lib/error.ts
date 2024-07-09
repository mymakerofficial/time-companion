import type { Optional } from '@shared/lib/utils/types'

export const SQLiteErrorCode = {
  Error: 'SQLITE_ERROR',
  Abort: 'SQLITE_ABORT',
  Busy: 'SQLITE_BUSY',
  CantOpen: 'SQLITE_CANTOPEN',
  Constraint: 'SQLITE_CONSTRAINT',
  Corrupt: 'SQLITE_CORRUPT',
  Empty: 'SQLITE_EMPTY',
  ConstraintCheck: 'SQLITE_CONSTRAINT_CHECK',
  ConstraintCommitHook: 'SQLITE_CONSTRAINT_COMMIT_HOOK',
  ConstraintDatatype: 'SQLITE_CONSTRAINT_DATATYPE',
  ConstraintForeignKey: 'SQLITE_CONSTRAINT_FOREIGNKEY',
  ConstraintFunction: 'SQLITE_CONSTRAINT_FUNCTION',
  ConstraintNotNull: 'SQLITE_CONSTRAINT_NOTNULL',
  ConstraintPinned: 'SQLITE_CONSTRAINT_PINNED',
  ConstraintPrimaryKey: 'SQLITE_CONSTRAINT_PRIMARYKEY',
  ConstraintRowId: 'SQLITE_CONSTRAINT_ROWID',
  ConstraintTrigger: 'SQLITE_CONSTRAINT_TRIGGER',
  ConstraintUnique: 'SQLITE_CONSTRAINT_UNIQUE',
  ConstraintVtab: 'SQLITE_CONSTRAINT_VTAB',
  CorruptIndex: 'SQLITE_CORRUPT_INDEX',
  CorruptSequence: 'SQLITE_CORRUPT_SEQUENCE',
} as const
export type SQLiteErrorCode =
  (typeof SQLiteErrorCode)[keyof typeof SQLiteErrorCode]

const SQLiteErrorMessage: Record<SQLiteErrorCode, Optional<string>> = {
  [SQLiteErrorCode.Error]: undefined,
  [SQLiteErrorCode.Abort]: 'Application requested an abort',
  [SQLiteErrorCode.Busy]: 'The database file is locked',
  [SQLiteErrorCode.CantOpen]: 'Unable to open the database file',
  [SQLiteErrorCode.Constraint]: 'An SQL constraint violation occurred',
  [SQLiteErrorCode.Corrupt]: 'The database file is malformed',
  [SQLiteErrorCode.Empty]: 'Database is empty',
  [SQLiteErrorCode.ConstraintCheck]: 'CHECK constraint failed',
  [SQLiteErrorCode.ConstraintCommitHook]: 'Commit hook failed',
  [SQLiteErrorCode.ConstraintDatatype]: 'Datatype mismatch',
  [SQLiteErrorCode.ConstraintForeignKey]: 'Foreign key constraint failed',
  [SQLiteErrorCode.ConstraintFunction]: 'Function failed',
  [SQLiteErrorCode.ConstraintNotNull]: 'NOT NULL constraint failed',
  [SQLiteErrorCode.ConstraintPinned]: 'Abort due to pinned shared cache',
  [SQLiteErrorCode.ConstraintPrimaryKey]: 'PRIMARY KEY constraint failed',
  [SQLiteErrorCode.ConstraintRowId]: 'ROWID constraint failed',
  [SQLiteErrorCode.ConstraintTrigger]: 'Trigger failed',
  [SQLiteErrorCode.ConstraintUnique]: 'UNIQUE constraint failed',
  [SQLiteErrorCode.ConstraintVtab]: 'Virtual table constraint failed',
  [SQLiteErrorCode.CorruptIndex]: 'Index is corrupt',
  [SQLiteErrorCode.CorruptSequence]: 'Sequence is corrupt',
} as const

export class SQLiteError extends Error {
  public code: SQLiteErrorCode

  constructor(code: string, message?: string) {
    super(`${code}: ${SQLiteErrorMessage[code as SQLiteErrorCode] ?? message}`)
    this.name = 'SQLiteError'
    this.code = code as SQLiteErrorCode
  }
}

export function resolveSqliteError(error: Error): SQLiteError {
  if (isSqliteWasmError(error)) {
    const [code, message] = error.message.split(':')
    return new SQLiteError(code, message)
  } else if (isBetterSqlite3Error(error)) {
    return new SQLiteError(error.code, error.message)
  } else {
    return new SQLiteError(SQLiteErrorCode.Error, 'Unknown SQLite error')
  }
}

export function handleSqliteError(error: Error): never {
  if (isOriginalSqliteError(error)) {
    throw resolveSqliteError(error)
  } else {
    throw error
  }
}

function isSqliteWasmError(
  error: object,
): error is { message: string; name: string; resultCode: number } {
  return 'resultCode' in error
}

function isBetterSqlite3Error(
  error: object,
): error is { message: string; name: string; code: string } {
  return 'code' in error
}

function isOriginalSqliteError(error: object): boolean {
  return isSqliteWasmError(error) || isBetterSqlite3Error(error)
}
