export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly detail?: string,
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/***
 * This error is thrown when trying to perform an operation on a database that is not open.
 */
export class DatabaseNotOpenError extends DatabaseError {
  constructor() {
    super('Database is not open.')
    this.name = 'DatabaseNotOpenError'
  }
}

export class DatabaseAlreadyOpenError extends DatabaseError {
  constructor() {
    super('Database is already open.')
    this.name = 'DatabaseAlreadyOpenError'
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
      `Database version is too high. Tried to migrate to version "${targetVersion}" but current version is "${currentVersion}".`,
    )
    this.name = 'DatabaseVersionTooHighError'
  }
}

/***
 * This error is thrown when the database version could not be acquired.
 */
export class DatabaseVersionMissingError extends DatabaseError {
  constructor() {
    super('Database version could not be accessed.')
    this.name = 'DatabaseVersionMissingError'
  }
}

/***
 * This error is thrown when trying to perform schema alterations on with a transaction that is not a versionchange transaction.
 */
export class DatabaseInvalidTransactionError extends DatabaseError {
  constructor() {
    super('Transaction is not a versionchange transaction.')
    this.name = 'DatabaseInvalidTransactionError'
  }
}

export class DatabaseInvalidRangeColumnError extends DatabaseError {
  constructor(public readonly columnName: string) {
    super(
      'Range column must be indexed or primary key.',
      `Column "${columnName}" is neither indexed or primary key.`,
    )
    this.name = 'DatabaseInvalidRangeColumnError'
  }
}

export class DatabaseUndefinedTableError extends DatabaseError {
  constructor(public readonly tableName: string) {
    super(`Table "${tableName}" does not exist.`)
    this.name = 'DatabaseUndefinedTableError'
  }
}

export class DatabaseUndefinedColumnError extends DatabaseError {
  constructor(
    public readonly tableName: string,
    public readonly columnName: string,
  ) {
    super(`Column "${columnName}" of table "${tableName}" does not exist.`)
    this.name = 'DatabaseUndefinedColumnError'
  }
}

export class DatabaseUniqueViolationError extends DatabaseError {
  constructor(
    public readonly tableName: string,
    public readonly columnName: string,
    public readonly value: string,
  ) {
    super(
      `Unique constraint violated on column "${columnName}".`,
      `${tableName}.${columnName}=${value} already exists.`,
    )
    this.name = 'DatabaseUniqueViolationError'
  }
}
