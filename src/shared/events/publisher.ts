import { setOf } from '@shared/lib/utils/list'
import { isDefined } from '@shared/lib/utils/checks'

export type PublisherChannel = string | symbol

export type SubscriberCallback<TEvent extends object> = (event: TEvent) => void

export interface Publisher<TEvent extends object> {
  subscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void
  unsubscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void
}

export class PublisherImpl<TEvent extends object> implements Publisher<TEvent> {
  private callbacks: Map<PublisherChannel, Set<SubscriberCallback<TEvent>>> =
    new Map()

  subscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void {
    const channelCallbacks = this.callbacks.get(channel)

    if (isDefined(channelCallbacks)) {
      channelCallbacks.add(callback)
    } else {
      this.callbacks.set(channel, setOf([callback]))
    }
  }

  unsubscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void {
    const channelCallbacks = this.callbacks.get(channel)

    if (isDefined(channelCallbacks)) {
      channelCallbacks.delete(callback)
    }
  }

  protected notify(channel: PublisherChannel, event: TEvent): void {
    const channelCallbacks = this.callbacks.get(channel)

    if (isDefined(channelCallbacks)) {
      channelCallbacks.forEach((callback) => callback(event))
    }
  }
}
