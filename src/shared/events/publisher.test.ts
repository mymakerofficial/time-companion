import { describe, it, vi, expect } from 'vitest'
import { PublisherImpl, PublisherTopics } from '@shared/events/publisher'

type TestTypes = 'updated' | 'deleted' | 'created'

type TestTopics = {
  type: TestTypes
  entity: number
}

type TestEvent = {
  message: string
}

class TestPublisherImpl extends PublisherImpl<TestTopics, TestEvent> {
  public getSubscribers() {
    return this.subscribers
  }

  public testMatchTopic(
    notifyTopics: PublisherTopics<TestTopics>,
    subscribedTopics: PublisherTopics<TestTopics>,
  ): boolean {
    return super.matches(notifyTopics, subscribedTopics)
  }

  public testNotify(
    topics: PublisherTopics<TestTopics>,
    event: TestEvent,
  ): void {
    super.notify(topics, event)
  }
}

describe('publisher', () => {
  const publisher = new TestPublisherImpl()

  describe.shuffle('notify', () => {
    it('should notify a subscriber with no specified topic of all events', () => {
      const subscriber = vi.fn()

      publisher.subscribe({}, subscriber)

      publisher.testNotify({ type: 'updated', entity: 42 }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: 'updated', entity: 42 },
      )

      publisher.unsubscribe({}, subscriber)
    })

    it('should not notify a subscriber after unsubscribing', () => {
      const subscriber = vi.fn()
      const otherSubscriber = vi.fn()

      publisher.subscribe({ type: 'updated' }, subscriber)
      publisher.subscribe({ type: 'updated' }, otherSubscriber)

      publisher.unsubscribe({ type: 'updated' }, subscriber)
      publisher.unsubscribe({ type: 'created' }, subscriber) // should not do anything

      publisher.testNotify({ type: 'updated' }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledTimes(0)
      expect(otherSubscriber).toHaveBeenCalledTimes(1)

      expect(publisher.getSubscribers().length).toBe(1)

      publisher.unsubscribe({ type: 'updated' }, otherSubscriber)
    })

    it('should notify a subscriber with a specified topic', () => {
      const subscriber = vi.fn()

      publisher.subscribe({ type: 'updated' }, subscriber)

      publisher.testNotify({ type: 'updated', entity: 42 }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: 'updated', entity: 42 },
      )

      publisher.unsubscribe({ type: 'updated' }, subscriber)
    })

    it('should notify a subscriber with multiple specified topics', () => {
      const subscriber = vi.fn()

      publisher.subscribe({ type: ['updated', 'deleted'] }, subscriber)

      publisher.testNotify({ type: 'updated', entity: 42 }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: 'updated', entity: 42 },
      )

      publisher.testNotify({ type: 'deleted', entity: 42 }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: 'updated', entity: 42 },
      )

      publisher.unsubscribe({ type: ['updated', 'deleted'] }, subscriber)
    })

    it('should notify subscribers to all topic values when an array is specified', () => {
      const updateSubscriber = vi.fn()
      const deleteSubscriber = vi.fn()

      publisher.subscribe({ type: 'updated' }, updateSubscriber)
      publisher.subscribe({ type: 'deleted' }, deleteSubscriber)

      publisher.testNotify(
        { type: ['updated', 'deleted'] },
        { message: 'test' },
      )

      expect(updateSubscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: ['updated', 'deleted'] },
      )
      expect(deleteSubscriber).toHaveBeenCalledWith(
        { message: 'test' },
        { type: ['updated', 'deleted'] },
      )
    })

    it('should not notify a subscriber with a different topic', () => {
      const subscriber = vi.fn((...args) => {})

      publisher.subscribe({ type: 'updated' }, subscriber)

      publisher.testNotify({ type: 'deleted' }, { message: 'test' })

      expect(subscriber).toHaveBeenCalledTimes(0)

      publisher.unsubscribe({ type: 'updated' }, subscriber)
    })
  })

  describe('match topics', () => {
    it.each([
      [{ type: 'updated' }, { type: 'updated' }, true],
      [{ type: ['updated', 'deleted'] }, { type: 'updated' }, true],
      [{ type: 'updated' }, { type: ['updated', 'deleted'] }, true],
      [{ type: 'updated' }, { type: 'updated', entity: 42 }, true],
      [{ type: 'updated', entity: 42 }, { type: 'updated' }, true],
      [{ type: 'updated', entity: 42 }, { type: 'updated', entity: 42 }, true],
      [{ entity: 42 }, { type: 'updated' }, true],
      [{ entity: 42 }, { type: 'updated', entity: null }, true],
      [{}, { type: 'updated' }, true],
      [{ type: 'updated' }, {}, true],
      //
      [{ type: 'updated' }, { type: 'deleted' }, false],
      [{ type: ['updated', 'created'] }, { type: 'deleted' }, false],
      [{ type: 'deleted' }, { type: ['updated', 'created'] }, false],
      [{ type: 'updated', entity: 21 }, { type: 'updated', entity: 42 }, false],
      [{ type: 'updated', entity: 24 }, { type: 'updated', entity: 21 }, false],
    ] as unknown as [
      [PublisherTopics<TestTopics>, PublisherTopics<TestTopics>, boolean],
    ])('matches(%o, %o) -> %s', (notifyTopics, subscribedTopics, expected) => {
      expect(publisher.testMatchTopic(notifyTopics, subscribedTopics)).toBe(
        expected,
      )
    })
  })
})
