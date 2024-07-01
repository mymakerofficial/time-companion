import type { DatabaseConnector } from '@shared/drizzle/connector/connector'
import Database from 'better-sqlite3'

export class BetterSqlite3Connector implements DatabaseConnector {
  public database: Database.Database

  constructor(path: string) {
    this.database = new Database(path)
  }

  init(): Promise<void> {
    return Promise.resolve() // we don't need to do anything here
  }

  exec(sql: string): Promise<{ rows: Array<any> }> {
    return new Promise((resolve) => {
      const res = this.database.exec(sql)
      resolve({ rows: [res] })
    })
  }
}
