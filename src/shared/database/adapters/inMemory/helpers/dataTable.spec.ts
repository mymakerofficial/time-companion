import { describe, expect, it } from 'vitest'
import { InMemoryDataTableImpl } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { uuid } from '@shared/lib/utils/uuid'

type Entity = {
  id: string
  name: string
}

function byName(a: Entity, b: Entity) {
  return a.name.localeCompare(b.name)
}

describe('In Memory Data Table', () => {
  it('should sort an indexed key', () => {
    const table = new InMemoryDataTableImpl<Entity>('id')

    table.createIndex('name', false)

    const data = Array.from({ length: 10 }, (_, i) => ({
      id: uuid(),
      name: ['Charlie', 'David', 'Bob', 'Alice', 'Eve'][i % 2],
    }))

    data.forEach((item) => table.insert(item))

    const cursor = table.createCursor('name', 'desc')

    const results: Array<Entity> = []
    while (cursor.value()) {
      results.push(cursor.value()!)
      cursor.next()
    }

    expect(results.map((it) => it.name)).toEqual(
      data
        .sort(byName)
        .reverse()
        .map((it) => it.name),
    )
  })
})
