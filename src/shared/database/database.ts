export const whereBooleanOperators = ['AND', 'OR'] as const
export type WhereBooleanOperator = (typeof whereBooleanOperators)[number]

export const whereEqualityOperators = ['equals', 'notEquals'] as const
export type WhereEqualityOperator = (typeof whereEqualityOperators)[number]

export const whereStringOperators = ['contains', 'notContains'] as const
export type WhereStringOperator = (typeof whereStringOperators)[number]

export const whereListOperators = ['in', 'notIn'] as const
export type WhereListOperator = (typeof whereListOperators)[number]

export const whereNumberOperators = ['lt', 'lte', 'gt', 'gte'] as const
export type WhereNumberOperator = (typeof whereNumberOperators)[number]

export const whereOperators = [
  ...whereEqualityOperators,
  ...whereStringOperators,
  ...whereListOperators,
  ...whereNumberOperators,
] as const

export type WhereOperator = (typeof whereOperators)[number]

export type WhereInput<TData extends object> = {
  [O in WhereBooleanOperator]?: Array<WhereInput<TData>>
} & {
  [K in keyof TData]?: {
    [O in WhereEqualityOperator]?: TData[K]
  } & {
    [O in WhereStringOperator]?: string
  } & {
    [O in WhereListOperator]?: Array<TData[K]>
  } & {
    [O in WhereNumberOperator]?: number
  }
}

const orderDirections = ['asc', 'desc'] as const
export type OrderByDirection = (typeof orderDirections)[number]

export type OrderByInput<TData extends object> = {
  [K in keyof TData]?: OrderByDirection
}

export type CreateArgs<TData extends object> = {
  data: TData
}

export type CreateManyArgs<TData extends object> = {
  data: Array<TData>
}

export type FindArgs<TData extends object> = {
  where?: WhereInput<TData>
  orderBy?: OrderByInput<TData> | Array<OrderByInput<TData>>
}

export type FindManyArgs<TData extends object> = FindArgs<TData> & {
  offset?: number
  limit?: number
}

export type UpdateArgs<TData extends object> = {
  where: WhereInput<TData>
  data: Partial<TData>
}

export type UpdateManyArgs<TData extends object> = UpdateArgs<TData>

export type DeleteArgs<TData extends object> = {
  where: WhereInput<TData>
}

export type DeleteManyArgs<TData extends object> = DeleteArgs<TData>

export interface Queryable<TData extends object> {
  findFirst(args?: FindArgs<TData>): Promise<TData>
  findMany(args?: FindManyArgs<TData>): Promise<Array<TData>>
}

export interface Updatable<TData extends object> {
  update(args: UpdateArgs<TData>): Promise<TData>
  updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>>
}

export interface Deletable<TData extends object> {
  delete(args: DeleteArgs<TData>): Promise<void>
  deleteMany(args: DeleteManyArgs<TData>): Promise<void>
}

export interface Table<TData extends object>
  extends Queryable<TData>,
    Updatable<TData>,
    Deletable<TData> {
  create(args: CreateArgs<TData>): Promise<TData>
  createMany(args: CreateManyArgs<TData>): Promise<Array<TData>>
}

export type LeftJoinArgs<
  TLeftData extends object,
  TRightData extends object,
> = {
  on: {
    [K in keyof TLeftData]?: keyof TRightData
  }
  where?: WhereInput<TRightData>
}

export interface LeftJoin<TData extends object> extends Queryable<TData> {}

export interface Join<TLeftData extends object, TRightData extends object> {
  left(args: LeftJoinArgs<TLeftData, TRightData>): LeftJoin<TLeftData>
}

export const columnTypes = ['string', 'number', 'boolean'] as const
export type ColumnType = (typeof columnTypes)[number]

export type CreateTableArgs = {
  name: string
  schema: {
    [key: string]: ColumnType
  }
}

export interface Transaction {
  table<TData extends object>(tableName: string): Table<TData>
  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): Join<TLeftData, TRightData>
}

export interface Database {
  createTransaction<TData extends object>(
    fn: (transaction: Transaction) => Promise<TData>,
  ): Promise<TData>
  createTable(args: CreateTableArgs): Promise<void>
}
