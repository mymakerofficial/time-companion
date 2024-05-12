import { describe, expect, onTestFinished, test } from 'vitest'
import { pgliteAdapter } from '@shared/database/adapters/pglite/database'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { defineTable } from '@shared/database/schema/defineTable'
import { string } from '@shared/database/schema/columnBuilder'
import { uuid } from '@shared/lib/utils/uuid'
import { faker } from '@faker-js/faker'

describe.sequential('pglite', () => {
  const adapter = pgliteAdapter()

  const testTable = defineTable('test', {
    id: string().primaryKey(),
    name: string().nullable(),
  })

  test('open the database', async () => {
    const tx = await adapter.openDatabase('test', 1)

    check(isNotNull(tx), 'No transaction is open.')

    await tx.createTable(testTable._.raw)

    await tx.commit()
  })

  test('do a query', async () => {
    const tx = await adapter.openTransaction(['test'], 'readwrite')

    const testData = {
      id: uuid(),
      name: faker.internet.userName(),
    }

    await tx.getTable('test').insert({
      data: testData,
    })

    const res = await tx.getTable('test').select({
      orderByTable: 'test',
      orderByColumn: 'id',
      oderByDirection: 'asc',
      limit: null,
      offset: null,
      where: null,
    })

    onTestFinished(async () => {
      await tx.commit()
    })

    expect(res).toEqual([testData])
  })
})
