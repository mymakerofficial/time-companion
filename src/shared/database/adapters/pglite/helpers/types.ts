export const pgColumnTypes = ['text', 'integer', 'boolean'] as const
export type PgColumnType = (typeof pgColumnTypes)[number]
