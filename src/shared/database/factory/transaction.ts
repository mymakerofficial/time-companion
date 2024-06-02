import type { Transaction } from '@shared/database/types/database'
import type { TransactionAdapter } from '@shared/database/types/adapter'
import type { TableSchemaRaw } from '@shared/database/types/schema'
import { DatabaseQuertyFactoryImpl } from '@shared/database/factory/queryFactory'

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
