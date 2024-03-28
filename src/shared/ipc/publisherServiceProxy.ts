import type { Publisher, PublisherChannel } from '@shared/events/publisher'
import { PublisherImpl } from '@shared/events/publisher'

// notify is a protected method, but we need to call it, so we expose it
class OpenPublisher<TEvent extends object> extends PublisherImpl<TEvent> {
  notify(channel: PublisherChannel, event: TEvent) {
    super.notify(channel, event)
  }
}

// creates a proxy object that forwards all method calls except 'subscribe' and 'unsubscribe' to the invoke function.
//  'subscribe' and 'unsubscribe' are used to register and unregister subscriber callbacks to an internal publisher.
// <br/>
// An internal publisher is created to handle subscribers, since we can't serialize the callbacks.
export function createPublisherServiceProxy<
  TService extends Publisher<TEvent>,
  TEvent extends object,
>({
  invoke,
  onNotify,
}: {
  invoke: (method: string, ...args: any[]) => Promise<any>
  onNotify: (callback: (event: object, channel: string) => void) => void
}): TService {
  // we create a new publisher instead of forwarding the subscribe and unsubscribe methods
  //  because we can't serialize the callbacks
  const publisher = new OpenPublisher<TEvent>()

  // to receive events from the actual service in the main process
  // we register a callback that subscribes us to all events
  onNotify((event, channel) => {
    publisher.notify(channel, event as TEvent)
  })

  // scary javascript magic
  return new Proxy(
    {},
    {
      get(_, method) {
        // forward subscribe to the internal publisher
        if (method === 'subscribe') {
          return (channel: string, callback: (event: TEvent) => void) => {
            publisher.subscribe(channel, callback)
          }
        }

        // forward unsubscribe to the internal publisher
        if (method === 'unsubscribe') {
          return (channel: string, callback: (event: TEvent) => void) => {
            publisher.unsubscribe(channel, callback)
          }
        }

        // forward all other methods to the invoke function
        return async (...args: any[]) => await invoke(method as string, ...args)
      },
    },
  ) as TService

  // fun fact: you can theoretically call any method on the proxy object
  //  there are no checks for the method name :)
  //  checks are done at runtime in the invoker
}
