import { emptySet, mapOf, setOf } from '@shared/lib/utils/list'
import { isDefined } from '@shared/lib/utils/checks'

export type PublisherChannel = string

export type SubscriberCallback<TEvent extends object> = (
  event: TEvent,
  channel: PublisherChannel,
) => void

export interface Publisher<TEvent extends object> {
  // register a callback to be called when an event is published on the channel
  subscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void
  // unregister a callback from the channel
  unsubscribe(
    channel: PublisherChannel,
    callback: SubscriberCallback<TEvent>,
  ): void
  // register a callback to be called when an event is published to any channel
  subscribeAll(callback: SubscriberCallback<TEvent>): void
}

export class PublisherImpl<TEvent extends object> implements Publisher<TEvent> {
  private static readonly allChannels: PublisherChannel = '__all_channels__'

  private callbacks: Map<PublisherChannel, Set<SubscriberCallback<TEvent>>> =
    mapOf([[PublisherImpl.allChannels, emptySet()]])

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

  subscribeAll(callback: SubscriberCallback<TEvent>): void {
    this.subscribe(PublisherImpl.allChannels, callback)
  }

  protected notify(channel: PublisherChannel, event: TEvent): void {
    const channelCallbacks = this.callbacks.get(channel)

    if (isDefined(channelCallbacks)) {
      channelCallbacks.forEach((callback) => callback(event, channel))
    }

    const allChannelsCallbacks = this.callbacks.get(PublisherImpl.allChannels)

    if (isDefined(allChannelsCallbacks)) {
      allChannelsCallbacks.forEach((callback) => callback(event, channel))
    }
  }
}
