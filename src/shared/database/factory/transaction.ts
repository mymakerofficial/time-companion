import type { Transaction } from '@database/types/database'
import type { TransactionAdapter } from '@database/types/adapter'
import type { TableSchemaRaw } from '@database/types/schema'
import { DatabaseQuertyFactoryImpl } from '@database/factory/queryFactory'

export class DatabaseTransactionImpl
  extends DatabaseQuertyFactoryImpl
  implements Transaction
{
  constructor(
    protected readonly transactionAdapter: TransactionAdapter,
    protected readonly runtimeSchema: Map<string, TableSchemaRaw>,
  ) {
    super(transactionAdapter, runtimeSchema)
  }
}
