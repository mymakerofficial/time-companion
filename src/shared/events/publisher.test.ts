import { describe, vi, it, expect, beforeAll, afterAll } from 'vitest'
import { PublisherImpl } from '@shared/events/publisher'

type TestEvent = {
  type: string
}

class TestPublisherImpl extends PublisherImpl<TestEvent> {
  public testNotify(channel: string, event: TestEvent): void {
    super.notify(channel, event)
  }
}

describe.sequential('publisher', () => {
  const publisher = new TestPublisherImpl()

  const fooSubscriber = vi.fn()
  const barSubscriber = vi.fn()

  beforeAll(() => {
    publisher.subscribe('foo', fooSubscriber)
    publisher.subscribe('bar', barSubscriber)
  })

  afterAll(() => {
    publisher.unsubscribe('foo', fooSubscriber)
    publisher.unsubscribe('bar', barSubscriber)
  })

  it('should notify subscriber', () => {
    const event = { type: 'test' }

    publisher.testNotify('foo', event)

    expect(fooSubscriber).toHaveBeenCalledTimes(1)
    expect(fooSubscriber).toHaveBeenCalledWith(event, 'foo')
  })

  it('should not notify a subscriber on a different channel', () => {
    publisher.testNotify('foo', { type: 'test' })

    expect(barSubscriber).toHaveBeenCalledTimes(0)
  })

  it('should not notify an unsubscribed subscriber', () => {
    publisher.unsubscribe('bar', barSubscriber)

    publisher.testNotify('bar', { type: 'test' })

    expect(barSubscriber).toHaveBeenCalledTimes(0)
  })
})
