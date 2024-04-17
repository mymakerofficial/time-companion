import { test, vi, expect } from 'vitest'
import { createFixtures } from '@test/helpers/createFixtures'

test('createFixtures', () => {
  const createFoo = vi.fn(() => 'foo')
  const createBar = vi.fn(() => 'bar')
  const createFooBar = vi.fn(({ foo, bar }) => foo + bar)
  const createDummy = vi.fn(() => 'dummy')

  const useFixtures = createFixtures({
    foo: createFoo,
    bar: createBar,
    fooBar: createFooBar,
    dummy: createDummy,
  })

  const { foo, bar, fooBar } = useFixtures()

  expect(foo).toEqual('foo')
  expect(bar).toEqual('bar')
  expect(fooBar).toEqual('foobar')

  expect(createFoo).toHaveBeenCalledTimes(1)
  expect(createBar).toHaveBeenCalledTimes(1)
  expect(createFooBar).toHaveBeenCalledTimes(1)

  expect(createDummy).not.toHaveBeenCalled()

  // don't actually test if the fixture function has been called with the correct values
  //  because we use a proxy to resolve the fixtures and the values won't be present
  //  until they are actually accessed
  // expect(createFooBar).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' })
})
