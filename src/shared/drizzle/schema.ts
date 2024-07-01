/***
 * This file is used to define the database schema and generate migrations.
 * This file may not contain any side effects or export anything but the tables.
 * @see https://orm.drizzle.team/docs/migrations#quick-start
 */

import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { isNull } from 'drizzle-orm'
import { uuid } from '@shared/lib/utils/uuid'

/***
 * A signed integer representing the number of milliseconds since the Unix epoch.
 *  Automatically converted to a Date object by drizzle.
 * @see https://orm.drizzle.team/docs/column-types/sqlite#integer
 */
function timestamp(name: string) {
  return integer(name, { mode: 'timestamp' })
}

/***
 * A signed integer representing the number of milliseconds.
 *  Name is suffixed with `_ms` to make it clear that it's in milliseconds.
 * @see https://orm.drizzle.team/docs/column-types/sqlite#integer
 */
function duration(name: string) {
  return integer(`${name}_ms`)
}

/***
 * Common columns shared by all entity tables.
 */
const entityMixins = {
  id: text('id')
    .primaryKey()
    .$default(() => uuid()), // automatically generate a UUID for new entities
  createdAt: timestamp('created_at')
    .notNull()
    .$default(() => new Date()), // automatically set the creation date
  modifiedAt: timestamp('modified_at').$onUpdate(() => new Date()), // automatically update the modification date on every change
  deletedAt: timestamp('deleted_at'),
}

export const days = sqliteTable(
  'days',
  {
    ...entityMixins,
    date: timestamp('date').notNull(),
    targetBillableDuration: duration('target_billable_duration'),
  },
  (table) => ({
    // ensure there is only ever one day per date (that hasn't been deleted)
    dateIdx: uniqueIndex('date_idx')
      .on(table.date)
      .where(isNull(table.deletedAt)),
  }),
)

export const projects = sqliteTable(
  'projects',
  {
    ...entityMixins,
    displayName: text('display_name').notNull(),
    color: text('color'),
    isBillable: integer('is_billable', { mode: 'boolean' })
      .notNull()
      .default(true),
    isBreak: integer('is_break', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    // ensure there is only ever one project with a given display name (that hasn't been deleted)
    displayNameIdx: uniqueIndex('display_name_idx')
      .on(table.displayName)
      .where(isNull(table.deletedAt)),
  }),
)

export const tasks = sqliteTable(
  'tasks',
  {
    ...entityMixins,
    displayName: text('display_name').notNull(),
    color: text('color'),
  },
  (table) => ({
    // ensure there is only ever one task with a given display name (that hasn't been deleted)
    displayNameIdx: uniqueIndex('display_name_idx')
      .on(table.displayName)
      .where(isNull(table.deletedAt)),
  }),
)

export const timeEntries = sqliteTable(
  'time_entries',
  {
    ...entityMixins,
    dayId: text('day_id')
      .references(() => days.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    taskId: text('task_id').references(() => tasks.id, {
      onDelete: 'set null',
    }),
    description: text('description').notNull(),
    startedAt: timestamp('started_at').notNull(),
    stoppedAt: timestamp('stopped_at'),
  },
  (table) => ({
    // it's impossible to have two time entries starting at the same time without also overlapping
    startedAtIdx: uniqueIndex('started_at_idx')
      .on(table.startedAt)
      .where(isNull(table.deletedAt)),
    // same as above
    //  note: it isn't possible to check for uniqueness of null values in SQLite
    //  thus, this needs to be enforced in the application logic
    //  https://www.sqlite.org/lang_createindex.html#unique_indexes
    stoppedAtIdx: uniqueIndex('stopped_at_idx')
      .on(table.stoppedAt)
      .where(isNull(table.deletedAt)),
  }),
)
