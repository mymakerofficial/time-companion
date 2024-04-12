import type {
  Publisher,
  PublisherTopics,
  SubscriberCallback,
} from '@shared/events/publisher'
import { PublisherImpl } from '@shared/events/publisher'
import {
  asyncResolveResult,
  resolveResult,
} from '@shared/lib/helpers/resulting'

// notify is a protected method, but we need to call it, so we expose it
class OpenPublisher<
  TTopics extends object,
  TEvent extends object,
> extends PublisherImpl<TTopics, TEvent> {
  notify(topics: PublisherTopics<TTopics>, event: TEvent) {
    super.notify(topics, event)
  }
}

// creates a proxy object that forwards all method calls except 'subscribe' and 'unsubscribe' to the invoke function.
//  'subscribe' and 'unsubscribe' are used to register and unregister subscriber callbacks to an internal publisher.
// <br/>
// An internal publisher is created to handle subscribers, since we can't serialize the callbacks.
export function createPublisherServiceProxy<
  TService extends Publisher<TTopics, TEvent>,
  TTopics extends object,
  TEvent extends object,
>({
  invoke,
  onNotify,
}: {
  invoke: (method: string, ...args: any[]) => Promise<any>
  onNotify: (callback: (event: object, topics: object) => void) => void
}): TService {
  // we create a new publisher instead of forwarding the subscribe and unsubscribe methods
  //  because we can't serialize the callbacks
  const publisher = new OpenPublisher<TTopics, TEvent>()

  // to receive events from the actual service in the main process
  // we register a callback that subscribes us to all events
  onNotify((event, topics) => {
    publisher.notify(topics as PublisherTopics<TTopics>, event as TEvent)
  })

  // scary javascript magic
  return new Proxy(
    {},
    {
      get(_, method) {
        // forward subscribe to the internal publisher
        if (method === 'subscribe') {
          return (
            topics: PublisherTopics<TTopics>,
            callback: SubscriberCallback<TTopics, TEvent>,
          ) => {
            publisher.subscribe(topics, callback)
          }
        }

        // forward unsubscribe to the internal publisher
        if (method === 'unsubscribe') {
          return (
            topics: PublisherTopics<TTopics>,
            callback: SubscriberCallback<TTopics, TEvent>,
          ) => {
            publisher.unsubscribe(topics, callback)
          }
        }

        // forward all other methods to the invoke function
        return async (...args: any[]) => {
          return await asyncResolveResult(invoke(method as string, ...args))
        }
      },
    },
  ) as TService

  // fun fact: you can theoretically call any method on the proxy object
  //  there are no checks for the method name :)
  //  checks are done at runtime in the invoker
}
