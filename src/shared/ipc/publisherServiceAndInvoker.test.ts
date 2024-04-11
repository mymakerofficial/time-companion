import { describe, it, vi, expect } from 'vitest'
import {
  type EntityPublisherEvent,
  EntityPublisherImpl,
  type EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import { createInvoker } from '@shared/ipc/invoker'
import { createPublisherServiceProxy } from '@shared/ipc/publisherServiceProxy'
import { faker } from '@faker-js/faker'
import { uuid } from '@shared/lib/utils/uuid'
import type { PublisherTopics } from '@shared/events/publisher'

type TestEntity = {
  id: string
  name: string
}

class TestService extends EntityPublisherImpl<TestEntity> {
  testNotify(
    topics: PublisherTopics<EntityPublisherTopics<TestEntity>>,
    event: EntityPublisherEvent<TestEntity>,
  ): void {
    super.notify(topics, event)
  }

  async testMethod(value: string): Promise<string> {
    return Promise.resolve(value)
  }
}

function getTestTopics(): PublisherTopics<EntityPublisherTopics<TestEntity>> {
  return { type: 'updated' }
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
    EntityPublisherTopics<TestEntity>,
    EntityPublisherEvent<TestEntity>
  >({
    invoke: async (method, ...args) => await invoker.invoke(method, ...args),
    onNotify: (callback: (event: object, topics: object) => void) => {
      service.subscribe({}, callback)
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
      await expect(() => proxy.notAMethod()).rejects.toThrowError(
        'Method notAMethod not found',
      )
    })
  })

  describe('events', () => {
    it('should forward events', () => {
      const topics = getTestTopics()
      const event = getTestEvent()

      const directSubscriber = vi.fn()
      const proxySubscriber = vi.fn()

      service.subscribe(topics, directSubscriber)
      proxy.subscribe(topics, proxySubscriber)

      proxy.testNotify(topics, event)

      expect(directSubscriber).toHaveBeenCalledTimes(1)
      expect(directSubscriber).toHaveBeenCalledWith(event, topics)

      expect(proxySubscriber).toHaveBeenCalledTimes(1)
      expect(proxySubscriber).toHaveBeenCalledWith(event, topics)
    })

    it('should not forward events from other channels', () => {
      const subscriber = vi.fn()

      proxy.subscribe({ type: 'deleted' }, subscriber)

      proxy.testNotify(getTestTopics(), getTestEvent())

      expect(subscriber).toHaveBeenCalledTimes(0)
    })

    it('should not forward events after unsubscribing', () => {
      const topics = getTestTopics()
      const event = getTestEvent()

      const directSubscriber = vi.fn()
      const proxySubscriber = vi.fn()

      service.subscribe(topics, directSubscriber)
      proxy.subscribe(topics, proxySubscriber)

      service.unsubscribe(topics, directSubscriber)
      proxy.unsubscribe(topics, proxySubscriber)

      proxy.testNotify(topics, event)

      expect(directSubscriber).toHaveBeenCalledTimes(0)
      expect(proxySubscriber).toHaveBeenCalledTimes(0)
    })
  })
})
