export type DatabaseWhere<T> = {
  [K in keyof T]?: { eq: T[K] } | { ne: T[K] }
}

export interface DatabaseOperation {
  table: string
}

export interface DatabaseQuery<T> extends DatabaseOperation {
  where?: DatabaseWhere<T>
  limit?: number
  offset?: number
  orderBy?: keyof T
  orderDirection?: 'asc' | 'desc'
}

export interface DatabaseInsert<T> extends DatabaseOperation {
  data: T
}

export interface DatabaseUpdate<T> extends DatabaseOperation {
  where: DatabaseWhere<T>
  data: Partial<T>
}

export interface DatabaseDelete<T> extends DatabaseOperation {
  where: DatabaseWhere<T>
}

export interface Database {
  getFirst<T>(operation: DatabaseQuery<T>): Promise<T>
  getAll<T>(operation: DatabaseQuery<T>): Promise<Array<T>>
  insertOne<T>(operation: DatabaseInsert<T>): Promise<T>
  updateOne<T>(operation: DatabaseUpdate<T>): Promise<T>
  deleteOne<T>(operation: DatabaseDelete<T>): Promise<void>
}
