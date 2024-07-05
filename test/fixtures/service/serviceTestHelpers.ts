import type { Database } from '@shared/drizzle/database'
import { initialize } from '@shared/drizzle/init'
import { migrate } from '@shared/drizzle/migrator'
import * as schema from '@shared/drizzle/schema'
import { valuesOf } from '@shared/lib/utils/object'
import { sql } from 'drizzle-orm'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

function fsRead(path: string) {
  return fs.readFileSync(path).toString()
}

function cryptoSha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export class ServiceTestHelpers {
  constructor(private readonly database: Database) {}

  async setup() {
    const basePath = path.join(process.cwd(), `/public/migrations`)

    await initialize(this.database)
    await migrate(this.database, {
      basePath,
      fetchFn: fsRead,
      hashFn: cryptoSha256,
    })
  }

  async cleanup() {
    for (const table of valuesOf(schema)) {
      await this.database.run(sql`DELETE FROM ${table}`)
    }
  }

  async teardown() {
    for (const table of valuesOf(schema)) {
      await this.database.run(sql`DROP TABLE IF EXISTS ${table}`)
    }
  }
}
