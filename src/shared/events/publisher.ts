import type { MaybeArray, Nullable, Pair } from '@shared/lib/utils/types'
import { entriesOf } from '@shared/lib/utils/object'
import { isAbsent } from '@shared/lib/utils/checks'
import { arraysHaveOverlap, asArray } from '@shared/lib/utils/list'

export type PublisherTopics<TTopics extends object> = {
  [K in keyof TTopics]?: Nullable<MaybeArray<TTopics[K]>>
}

export type SubscriberCallback<
  TTopics extends object,
  TEvent extends object,
> = (event: TEvent, topics: PublisherTopics<TTopics>) => void

export interface Publisher<TTopics extends object, TEvent extends object> {
  /***
   * Subscribe a callback to one or more topics.
   *
   *
   * Topic matching works as follows:
   * - If a topic is not specified, it will match any value for that topic
   * - If a topic is specified, it will only match that value for that topic
   * - If a topic is an array, it will match any value in that array
   * - **for a subscriber to be notified, all topics must match**
   *
   * @param topics - the topics to subscribe to
   * @param callback - the callback to be notified
   *
   * @example
   * ```typescript
   * publisher.subscribe({ type: 'updated' }, subscriber) // subscribe to all 'updated' events
   * publisher.notify({ type: 'updated', entityId: '1' }, { data: 'new data' }) // subscriber will be notified
   * ```
   *
   * @example
   * ```typescript
   * publisher.subscribe({ type: ['updated', 'deleted'] }, subscriber) // subscribe to all 'updated' or 'deleted' events
   * publisher.notify({ type: 'updated', entityId: '1' }, { data: 'new data' }) // subscriber will be notified
   * ```
   *
   * @example
   * ```typescript
   * publisher.subscribe({ type:  'updated', entityId: '1' }, subscriber) // subscribe to all 'updated' events for entity '1'
   * publisher.notify({ type: 'updated', entityId: '2' }, { data: 'new data' }) // subscriber will NOT be notified
   * ```
   */
  subscribe(
    topics: PublisherTopics<TTopics>,
    callback: SubscriberCallback<TTopics, TEvent>,
  ): SubscriberCallback<TTopics, TEvent>
  // unsubscribe a callback.
  unsubscribe(
    topics: PublisherTopics<TTopics>,
    callback: SubscriberCallback<TTopics, TEvent>,
  ): void
}

export interface OpenPublisher<TTopics extends object, TEvent extends object>
  extends Publisher<TTopics, TEvent> {
  notify(topics: PublisherTopics<TTopics>, event: TEvent): void
}

export class PublisherImpl<TTopics extends object, TEvent extends object>
  implements Publisher<TTopics, TEvent>
{
  protected subscribers: Array<
    Pair<PublisherTopics<TTopics>, SubscriberCallback<TTopics, TEvent>>
  > = []

  protected matches(
    notifyTopics: PublisherTopics<TTopics>,
    subscribedTopics: PublisherTopics<TTopics>,
  ): boolean {
    return !entriesOf(subscribedTopics)
      .map(([key, value]) => {
        if (isAbsent(notifyTopics[key])) {
          return true
        }

        if (isAbsent(value)) {
          return true
        }

        if (arraysHaveOverlap(asArray(value), asArray(notifyTopics[key]))) {
          return true
        }

        return false
      })
      .includes(false)
  }

  protected getTopicSubscribers(
    notifyTopics: PublisherTopics<TTopics>,
  ): SubscriberCallback<TTopics, TEvent>[] {
    return this.subscribers
      .filter(([subscribedTopics]) =>
        this.matches(notifyTopics, subscribedTopics),
      )
      .map(([, callback]) => callback)
  }

  subscribe(
    topics: PublisherTopics<TTopics>,
    callback: SubscriberCallback<TTopics, TEvent>,
  ) {
    this.subscribers.push([topics, callback])
    return callback
  }

  unsubscribe(
    topics: PublisherTopics<TTopics>,
    callback: SubscriberCallback<TTopics, TEvent>,
  ) {
    this.subscribers = this.subscribers.filter(
      ([subscribedTopics, subscribedCallback]) =>
        subscribedCallback !== callback ||
        !this.matches(topics, subscribedTopics),
    )
  }

  protected notify(topics: PublisherTopics<TTopics>, event: TEvent) {
    const subscribers = this.getTopicSubscribers(topics)

    subscribers.forEach((callback) => callback(event, topics))
  }
}

export class OpenPublisherImpl<TTopics extends object, TEvent extends object>
  extends PublisherImpl<TTopics, TEvent>
  implements OpenPublisher<TTopics, TEvent>
{
  notify(topics: PublisherTopics<TTopics>, event: TEvent) {
    super.notify(topics, event)
  }
}
