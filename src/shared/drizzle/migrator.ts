import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db'
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core/dialect'
import type { ExtractTablesWithRelations } from 'drizzle-orm/relations'
import { SQLiteSession } from 'drizzle-orm/sqlite-core/session'
import { sql } from 'drizzle-orm'
import { getOrElse } from '@shared/lib/utils/result'
import { firstOfOrNull } from '@shared/lib/utils/list'
import type { MigrationMeta } from 'drizzle-orm/migrator'

// TODO: This probably won't work in a non-browser environment

/***
 * Migrate the database to the latest version.
 *
 * This function is an adapted version of the `migrate` function from drizzle that works in a browser environment.
 */
export async function migrate<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(database: BaseSQLiteDatabase<'sync', unknown, TSchema>) {
  // @ts-expect-error dialect and session are private, but we need to access it
  const { dialect, session } = database as {
    dialect: SQLiteSyncDialect
    session: SQLiteSession<
      'sync',
      undefined,
      TSchema,
      ExtractTablesWithRelations<TSchema>
    >
  }

  const migrationsTable = '__drizzle_migrations'

  // Migrations table might not exist yet, so catch the error and use an empty array instead
  const dbMigrations = getOrElse(
    () =>
      session.values<[number, string, string]>(
        sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`,
      ),
    [],
  ).map(([id, hash, createdAt]) => ({ id, hash, createdAt: Number(createdAt) }))
  const lastMigration = firstOfOrNull(dbMigrations)

  const journal = await fetchJournal()

  const migrationQueries: MigrationMeta[] = []
  for (const journalEntry of journal.entries) {
    if (lastMigration && journalEntry.when <= lastMigration.createdAt) {
      continue
    }

    const query = await fetchMigration(journalEntry.tag)
    const sql = query.split('--> statement-breakpoint')
    const hash = await sha256(query)

    migrationQueries.push({
      sql,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash,
    })
  }

  await new Promise<void>((resolve) => {
    dialect.migrate(migrationQueries, session)
    resolve()
  })
}

async function fetchJournal() {
  const journalResponse = await fetch('/migrations/meta/_journal.json')
  const journalText = await journalResponse.text()
  return JSON.parse(journalText) as {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[]
  }
}

async function fetchMigration(tag: string) {
  const migrationResponse = await fetch(`/migrations/${tag}.sql`)
  return await migrationResponse.text()
}

/***
 * Generates a SHA-256 hash of the input string
 * @source https://gist.github.com/GaspardP/fffdd54f563f67be8944
 */
async function sha256(input: string) {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const view = new DataView(hashBuffer)
  const padding = '00000000'
  let digest = ''
  for (let i = 0; i < view.byteLength; i += 4) {
    // We use getUint32 to reduce the number of iterations (notice the `i += 4`)
    const value = view.getUint32(i)
    // toString(16) will transform the integer into the corresponding hex string
    // but will remove any initial "0"
    const stringValue = value.toString(16)
    // One Uint32 element is 4 bytes or 8 hex chars (it would also work with 4
    // chars for Uint16 and 2 chars for Uint8)
    const paddedValue = (padding + stringValue).slice(-padding.length)
    digest += paddedValue
  }
  return digest
}
