export class DatabaseError extends Error {
  constructor(
    name: string = 'DatabaseError',
    message: string,
    public readonly detail?: string,
  ) {
    super(message)
    this.name = name
  }
}

/***
 * This error is thrown when trying to perform an operation on a database that is not open.
 */
export class DatabaseNotOpenError extends DatabaseError {
  constructor() {
    super('DatabaseNotOpenError', 'Database is not open.')
  }
}

export class DatabaseAlreadyOpenError extends DatabaseError {
  constructor() {
    super('DatabaseAlreadyOpenError', 'Database is already open.')
  }
}

/***
 * This error is thrown when the database version is higher than the highest migration version provided.
 */
export class DatabaseVersionTooHighError extends DatabaseError {
  constructor(
    public readonly currentVersion: number,
    public readonly targetVersion: number,
  ) {
    super(
      'DatabaseVersionTooHighError',
      `Database version is too high. Tried to migrate to version "${targetVersion}" but current version is "${currentVersion}".`,
    )
  }
}

/***
 * This error is thrown when the database version could not be acquired.
 */
export class DatabaseVersionMissingError extends DatabaseError {
  constructor() {
    super(
      'DatabaseVersionMissingError',
      'Database version could not be accessed.',
    )
  }
}

export class DatabaseSchemaMismatchError extends DatabaseError {
  constructor() {
    super(
      'DatabaseSchemaMismatchError',
      'The database schema after migration does not match the expected schema.',
    )
  }
}

/***
 * This error is thrown when trying to perform schema alterations on with a transaction that is not a versionchange transaction.
 */
export class DatabaseInvalidTransactionError extends DatabaseError {
  constructor() {
    super(
      'DatabaseInvalidTransactionError',
      'Transaction is not a versionchange transaction.',
    )
  }
}

export class DatabaseInvalidRangeColumnError extends DatabaseError {
  constructor(public readonly columnName: string) {
    super(
      'DatabaseInvalidRangeColumnError',
      'Range column must be indexed or primary key.',
      `Column "${columnName}" is neither indexed or primary key.`,
    )
  }
}

export class DatabaseUndefinedTableError extends DatabaseError {
  constructor(public readonly tableName: string) {
    super('DatabaseUndefinedTableError', `Table "${tableName}" does not exist.`)
  }
}

export class DatabaseUndefinedColumnError extends DatabaseError {
  constructor(
    public readonly tableName: string,
    public readonly columnName: string,
  ) {
    super(
      'DatabaseUndefinedColumnError',
      `Column "${columnName}" of table "${tableName}" does not exist.`,
    )
  }
}

export class DatabaseUniqueViolationError extends DatabaseError {
  constructor(
    public readonly tableName: string,
    public readonly columnName: string,
    public readonly value: string,
  ) {
    super(
      'DatabaseUniqueViolationError',
      `Unique constraint violated on column "${columnName}".`,
      `${tableName}.${columnName}=${value} already exists.`,
    )
  }
}

export class DatabaseDuplicateTableError extends DatabaseError {
  constructor(public readonly tableName: string) {
    super('DatabaseDuplicateTableError', `Table "${tableName}" already exists.`)
  }
}

export class DatabaseNotNullViolationError extends DatabaseError {
  constructor(
    public readonly tableName: string,
    public readonly columnName: string,
  ) {
    super(
      'DatabaseNotNullViolationError',
      `Column "${columnName}" of table "${tableName}" cannot be null.`,
    )
  }
}
