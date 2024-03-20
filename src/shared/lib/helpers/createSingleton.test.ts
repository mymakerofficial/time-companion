import { expect, test } from 'vitest'
import { createSingleton } from '@shared/lib/helpers/createSingleton'

test('createSingleton always returns same object', () => {
  const singleton = createSingleton(() => ({}))

  const first = singleton()
  const second = singleton()

  expect(first).toBe(second)
})
