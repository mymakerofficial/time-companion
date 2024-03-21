import type {
  Database,
  DatabaseDelete,
  DatabaseInsert,
  DatabaseQuery,
  DatabaseUpdate,
  DatabaseWhere,
  DatabaseWhereCondition,
} from '@shared/database/database'

interface ResolvedWhereCondition<T> {
  key: keyof T
  condition: DatabaseWhereCondition
  value: T[keyof T]
}

function resolveWhereConditions<T>(
  where: DatabaseWhere<T>,
): Array<ResolvedWhereCondition<T>> {
  return Object.entries(where).map(([key, value]) => ({
    key: key as keyof T,
    condition: Object.keys(value as any)[0] as DatabaseWhereCondition,
    value: Object.values(value as any)[0] as T[keyof T],
  }))
}

function where<T>(
  row: T,
  conditions: Array<ResolvedWhereCondition<T>>,
): boolean {
  return conditions.every(({ key, condition, value }) => {
    const rowValue = row[key]

    switch (condition) {
      case 'equals':
        return rowValue === value
      case 'notEquals':
        return rowValue !== value
      default:
        throw new Error(`Unknown condition: ${condition}`)
    }
  })
}

class InMemoryDatabase implements Database {
  data: Map<string, any>

  constructor() {
    this.data = new Map()
  }

  async createTable(name: string): Promise<void> {
    this.data.set(name, [])
  }

  async getAll<T>(operation: DatabaseQuery<T>): Promise<Array<T>> {
    const tableData = this.data.get(operation.table) as Array<T>

    if (!tableData) {
      throw new Error(`Table not found: ${operation.table}`)
    }

    if (!operation.where) {
      return tableData
    }

    const conditions = resolveWhereConditions(operation.where)

    return tableData.filter((row) => where(row, conditions))
  }

  async getFirst<T>(operation: DatabaseQuery<T>): Promise<T> {
    const all = await this.getAll<T>(operation)

    if (all.length === 0) {
      throw new Error('No data found')
    }

    return all[0]
  }

  async insertOne<T>(operation: DatabaseInsert<T>): Promise<T> {
    const tableData = this.data.get(operation.table) as Array<T>

    if (!tableData) {
      throw new Error(`Table not found: ${operation.table}`)
    }

    tableData.push(operation.data)

    return operation.data as T
  }

  async updateOne<T>(operation: DatabaseUpdate<T>): Promise<T> {
    const tableData = this.data.get(operation.table) as Array<T>

    if (!tableData) {
      throw new Error(`Table not found: ${operation.table}`)
    }

    const conditions = resolveWhereConditions(operation.where)

    const index = tableData.findIndex((row) => where(row, conditions))

    if (index === -1) {
      throw new Error('No data found')
    }

    tableData[index] = operation.data

    return operation.data
  }

  async deleteOne<T>(operation: DatabaseDelete<T>): Promise<void> {
    const tableData = this.data.get(operation.table) as Array<T>

    if (!tableData) {
      throw new Error(`Table not found: ${operation.table}`)
    }

    const conditions = resolveWhereConditions(operation.where)

    const index = tableData.findIndex((row) => where(row, conditions))

    if (index === -1) {
      throw new Error('No data found')
    }

    tableData.splice(index, 1)
  }
}

export function createInMemoryDatabase(): Database {
  return new InMemoryDatabase()
}
