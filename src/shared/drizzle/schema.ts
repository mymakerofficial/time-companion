import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const days = sqliteTable('days', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull().unique(),
  targetBillableDuration: text('target_billable_duration'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  modifiedAt: integer('modified_at', { mode: 'timestamp' }).$onUpdateFn(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull().unique(),
  color: text('color'),
  isBillable: integer('is_billable', { mode: 'boolean' }),
  isBreak: integer('is_break', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  modifiedAt: integer('modified_at', { mode: 'timestamp' }).$onUpdateFn(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
  modifiedAt: integer('modified_at', { mode: 'timestamp' }).$onUpdateFn(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const timeEntries = sqliteTable(
  'time_entries',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .references(() => days.id)
      .notNull(),
    projectId: text('project_id').references(() => projects.id),
    taskId: text('task_id').references(() => tasks.id),
    description: text('description').notNull(),
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    stoppedAt: integer('stopped_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    modifiedAt: integer('modified_at', { mode: 'timestamp' }).$onUpdateFn(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => ({
    startedAtIdx: index('started_at_idx')
      .on(table.startedAt)
      .where(sql`${table.deletedAt} IS NULL`),
    stoppedAtIdx: index('stopped_at_idx')
      .on(table.stoppedAt)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
)
