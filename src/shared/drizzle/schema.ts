/***
 * This file is used to define the database schema and generate migrations.
 * This file may not contain any side effects or export anything but the tables.
 * @see https://orm.drizzle.team/docs/migrations#quick-start
 */

import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { uuid } from '@shared/lib/utils/uuid'
import {
  boolean,
  duration,
  plainDate,
  plainDateTime,
} from '@shared/drizzle/lib/columns'
import { PlainDateTime } from '@shared/lib/datetime/plainDateTime'

const hasId = {
  id: text('id')
    .primaryKey()
    .$default(() => uuid()), // automatically generate a UUID for new entities
}

const hasCreatedAt = {
  createdAt: plainDateTime('created_at')
    .notNull()
    .$default(() => PlainDateTime.now()), // automatically set the creation date
}

const hasModifiedAt = {
  modifiedAt: plainDateTime('modified_at').$onUpdate(() => PlainDateTime.now()), // automatically update the modification date on every change
}

/***
 * Common columns shared by all entity tables.
 */
const entityBase = {
  ...hasId,
  ...hasCreatedAt,
  ...hasModifiedAt,
}

export const days = sqliteTable(
  'days',
  {
    ...entityBase,
    date: plainDate('date').notNull(),
    targetBillableDuration: duration('target_billable_duration'),
  },
  (table) => ({
    // ensure there is only ever one day per date
    dateIdx: uniqueIndex('day_date_idx').on(table.date),
  }),
)

export const projects = sqliteTable(
  'projects',
  {
    ...entityBase,
    displayName: text('display_name').notNull(),
    color: text('color'),
    isBillable: boolean('is_billable').notNull().default(true),
    isBreak: boolean('is_break').notNull().default(false),
  },
  (table) => ({
    // ensure there is only ever one project with a given display name
    displayNameIdx: uniqueIndex('project_display_name_idx').on(
      table.displayName,
    ),
  }),
)

export const tasks = sqliteTable(
  'tasks',
  {
    ...entityBase,
    displayName: text('display_name').notNull(),
    color: text('color'),
  },
  (table) => ({
    // ensure there is only ever one task with a given display name
    displayNameIdx: uniqueIndex('task_display_name_idx').on(table.displayName),
  }),
)

export const timeEntries = sqliteTable(
  'time_entries',
  {
    ...entityBase,
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
    startedAt: plainDateTime('started_at').notNull(),
    stoppedAt: plainDateTime('stopped_at'),
  },
  (table) => ({
    // it's impossible to have two time entries starting at the same time without also overlapping
    startedAtIdx: uniqueIndex('time_entry_started_at_idx').on(table.startedAt),
    // same as above
    //  note: it isn't possible to check for uniqueness of null values in SQLite
    //  thus, this needs to be enforced in the application logic
    //  https://www.sqlite.org/lang_createindex.html#unique_indexes
    stoppedAtIdx: uniqueIndex('time_entry_stopped_at_idx').on(table.stoppedAt),
  }),
)

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
  ...hasModifiedAt,
})
