import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { isNull } from 'drizzle-orm'
import { uuid } from '@shared/lib/utils/uuid'

const entityMixins = {
  id: text('id')
    .primaryKey()
    .$default(() => uuid()),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  modifiedAt: integer('modified_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}

export const days = sqliteTable(
  'days',
  {
    ...entityMixins,
    date: integer('date', { mode: 'timestamp' }).notNull().unique(),
    targetBillableDuration: integer('target_billable_duration_ms'),
  },
  (table) => ({
    dateIdx: index('date_idx').on(table.date).where(isNull(table.deletedAt)),
  }),
)

export const projects = sqliteTable(
  'projects',
  {
    ...entityMixins,
    displayName: text('display_name').notNull().unique(),
    color: text('color'),
    isBillable: integer('is_billable', { mode: 'boolean' }),
    isBreak: integer('is_break', { mode: 'boolean' }),
  },
  (table) => ({
    displayNameIdx: index('display_name_idx')
      .on(table.displayName)
      .where(isNull(table.deletedAt)),
  }),
)

export const tasks = sqliteTable(
  'tasks',
  {
    ...entityMixins,
    displayName: text('display_name').notNull().unique(),
    color: text('color'),
  },
  (table) => ({
    displayNameIdx: index('display_name_idx')
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
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    stoppedAt: integer('stopped_at', { mode: 'timestamp' }),
  },
  (table) => ({
    startedAtIdx: index('started_at_idx')
      .on(table.startedAt)
      .where(isNull(table.deletedAt)),
    stoppedAtIdx: index('stopped_at_idx')
      .on(table.stoppedAt)
      .where(isNull(table.deletedAt)),
  }),
)
