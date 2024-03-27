import { describe, it, expect } from 'vitest'
import { createInvoker } from '@main/ipc/invoker'

class TestClass {
  public fizz = 'buzz'

  foo() {
    return 'bar'
  }
}

describe('ipc invoker', () => {
  it('should invoke the correct method and return its result', async () => {
    const testClass = new TestClass()

    const invoker = createInvoker(testClass)

    const res = await invoker.invoke('foo')

    expect(res).toBe('bar')
  })

  it('should throw an error if the method does not exist', async () => {
    const testClass = new TestClass()

    const invoker = createInvoker(testClass)

    expect(invoker.invoke('fizz')).rejects.toThrowError('Method fizz not found')
  })
})
