export type WhereBooleanOperator = 'AND' | 'OR'

export type WhereEqualityOperator = 'equals' | 'notEquals'
export type WhereStringOperator = 'contains' | 'notContains'
export type WhereListOperator = 'in' | 'notIn'
export type WhereNumberOperator = 'lt' | 'lte' | 'gt' | 'gte'
export type WhereOperator =
  | WhereEqualityOperator
  | WhereStringOperator
  | WhereListOperator
  | WhereNumberOperator

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

export type OrderByDirection = 'asc' | 'desc'

export type OrderByInput<TData extends object> = {
  [K in keyof TData]: OrderByDirection
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

export interface Table<TData extends object> {
  create(args: CreateArgs<TData>): Promise<TData>
  createMany(args: CreateManyArgs<TData>): Promise<Array<TData>>
  findFirst(args?: FindArgs<TData>): Promise<TData>
  findMany(args?: FindManyArgs<TData>): Promise<Array<TData>>
  update(args: UpdateArgs<TData>): Promise<TData>
  updateMany(args: UpdateManyArgs<TData>): Promise<Array<TData>>
  delete(args: DeleteArgs<TData>): Promise<void>
  deleteMany(args: DeleteManyArgs<TData>): Promise<void>
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

export interface LeftJoin<TData extends object> {
  findFirst(args?: FindArgs<TData>): Promise<TData>
  findMany(args?: FindManyArgs<TData>): Promise<Array<TData>>
}

export interface Join<TLeftData extends object, TRightData extends object> {
  left(args: LeftJoinArgs<TLeftData, TRightData>): LeftJoin<TLeftData>
}

export type ColumnType = 'string' | 'number' | 'boolean'

export type CreateTableArgs = {
  name: string
  schema: {
    [key: string]: ColumnType
  }
}

export interface Database {
  table<TData extends object>(tableName: string): Table<TData>
  join<TLeftData extends object, TRightData extends object>(
    leftTable: string,
    rightTable: string,
  ): Join<TLeftData, TRightData>
  createTable(args: CreateTableArgs): Promise<void>
}
