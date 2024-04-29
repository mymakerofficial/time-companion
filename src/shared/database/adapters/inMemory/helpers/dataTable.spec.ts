import { describe, expect, it } from 'vitest'
import { InMemoryDataTableImpl } from '@shared/database/adapters/inMemory/helpers/dataTable'
import { uuid } from '@shared/lib/utils/uuid'
import { cursorIterator } from '@shared/database/impl/helpers/cursorIterator'

type Entity = {
  id: string
  name: string
}

function byName(a: Entity, b: Entity) {
  return a.name.localeCompare(b.name)
}

describe('In Memory Data Table', () => {
  it('should sort an indexed key', async () => {
    const table = new InMemoryDataTableImpl<Entity>('id')

    table.createIndex('name', false)

    const data = Array.from({ length: 10 }, (_, i) => ({
      id: uuid(),
      name: ['Charlie', 'David', 'Bob', 'Alice', 'Eve'][i % 5],
    }))

    data.forEach((item) => table.insert(item))

    const iterator = cursorIterator<Entity>(table.createCursor('name', 'prev'))

    const results: Array<Entity> = []
    for await (const cursor of iterator) {
      results.push(cursor.value())
    }

    expect(results.map((it) => it.name)).toEqual(
      data
        .sort(byName)
        .reverse()
        .map((it) => it.name),
    )
  })

  it('should update a value and maintain index sorting', async () => {
    const table = new InMemoryDataTableImpl<Entity>('id')

    table.createIndex('name', false)

    const data = Array.from({ length: 10 }, (_, i) => ({
      id: uuid(),
      name: ['Charlie', 'David', 'Bob', 'Alice', 'Eve'][i % 5],
    }))

    data.forEach((item) => table.insert(item))

    const iterator = cursorIterator<Entity>(table.createCursor('name', 'next'))

    for await (const cursor of iterator) {
      if (cursor.value().name === 'Alice') {
        cursor.update({ name: 'Zelda' })
      }
    }

    const resultIterator = cursorIterator<Entity>(
      table.createCursor('name', 'next'),
    )

    const results: Array<Entity> = []
    for await (const cursor of resultIterator) {
      results.push(cursor.value())
    }

    expect(results.map((it) => it.name)).toEqual(
      data
        .map((it) => ({ ...it, name: it.name === 'Alice' ? 'Zelda' : it.name }))
        .sort(byName)
        .map((it) => it.name),
    )
  })

  it('should delete a value and maintain index sorting', async () => {
    const table = new InMemoryDataTableImpl<Entity>('id')

    table.createIndex('name', false)

    const data = Array.from({ length: 10 }, (_, i) => ({
      id: uuid(),
      name: ['Charlie', 'David', 'Bob', 'Alice', 'Eve'][i % 5],
    }))

    data.forEach((item) => table.insert(item))

    const iterator = cursorIterator<Entity>(table.createCursor('name', 'next'))

    for await (const cursor of iterator) {
      if (cursor.value().name === 'Bob') {
        cursor.delete()
      }
    }

    const resultIterator = cursorIterator<Entity>(
      table.createCursor('name', 'next'),
    )

    const results: Array<Entity> = []
    for await (const cursor of resultIterator) {
      results.push(cursor.value())
    }

    expect(results.map((it) => it.name)).toEqual(
      data
        .sort(byName)
        .map((it) => it.name)
        .filter((it) => it !== 'Bob'),
    )
  })
})
