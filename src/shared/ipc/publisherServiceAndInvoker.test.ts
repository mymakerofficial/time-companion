import { describe, it, vi, expect } from 'vitest'
import {
  EntityPublisherEvent,
  EntityPublisherImpl,
} from '@shared/events/entityPublisher'
import { createInvoker } from '@shared/ipc/invoker'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import { faker } from '@faker-js/faker'
import { uuid } from '@shared/lib/utils/uuid'

type TestEntity = {
  id: string
  name: string
}

class TestService extends EntityPublisherImpl<TestEntity> {
  testNotify(event: EntityPublisherEvent<TestEntity>): void {
    super.notify('test', event)
  }

  async testMethod(value: string): Promise<string> {
    return value
  }
}

function getTestEvent(): EntityPublisherEvent<TestEntity> {
  return {
    type: 'updated',
    data: { id: uuid(), name: faker.person.firstName() },
    changedFields: ['name'],
  }
}

describe('publisher service proxy and invoker', () => {
  // this test describes the communication between services on the main process
  //  and proxies for those services in the renderer process

  // in reality service and invoker would live in the main process
  const service = new TestService()
  const invoker = createInvoker(service)

  // in reality proxy would live in the renderer process
  const proxy = createPublisherServiceProxy<
    TestService,
    EntityPublisherEvent<TestEntity>
  >({
    invoke: async (method, ...args) => await invoker.invoke(method, ...args),
    onNotify: (callback: (event: object, channel: string) => void) => {
      service.subscribeAll(callback)
    },
  })

  describe('methods', () => {
    it('should forward method calls', async () => {
      const spy = vi.spyOn(service, 'testMethod')

      const res = await proxy.testMethod('foo')

      expect(spy).toHaveBeenCalledTimes(1)
      expect(res).toBe('foo')
    })

    it('should throw if the method does not exist', async () => {
      // @ts-expect-error
      expect(proxy.notAMethod()).rejects.toThrowError(
        'Method notAMethod not found',
      )
    })
  })

  describe('events', () => {
    it('should forward events', () => {
      const event = getTestEvent()

      const directSubscriber = vi.fn()
      const proxySubscriber = vi.fn()

      service.subscribe('test', directSubscriber)
      proxy.subscribe('test', proxySubscriber)

      proxy.testNotify(event)

      expect(directSubscriber).toHaveBeenCalledTimes(1)
      expect(directSubscriber).toHaveBeenCalledWith(event, 'test')

      expect(proxySubscriber).toHaveBeenCalledTimes(1)
      expect(proxySubscriber).toHaveBeenCalledWith(event, 'test')
    })

    it('should not forward events from other channels', () => {
      const event = getTestEvent()

      const subscriber = vi.fn()

      proxy.subscribe('other', subscriber)

      proxy.testNotify(event)

      expect(subscriber).toHaveBeenCalledTimes(0)
    })

    it('should not forward events after unsubscribing', () => {
      const event = getTestEvent()

      const directSubscriber = vi.fn()
      const proxySubscriber = vi.fn()

      service.subscribe('test', directSubscriber)
      proxy.subscribe('test', proxySubscriber)

      service.unsubscribe('test', directSubscriber)
      proxy.unsubscribe('test', proxySubscriber)

      proxy.testNotify(event)

      expect(directSubscriber).toHaveBeenCalledTimes(0)
      expect(proxySubscriber).toHaveBeenCalledTimes(0)
    })
  })
})
