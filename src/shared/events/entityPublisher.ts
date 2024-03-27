import {
  type Publisher,
  PublisherImpl,
  type SubscriberCallback,
} from '@shared/events/publisher'

export type EntityPublisherEvent<TData extends object> =
  | {
      type: 'updated'
      data: Readonly<TData>
      changedFields: ReadonlyArray<keyof TData>
    }
  | {
      type: 'deleted'
      data: null
      changedFields: []
    }

export interface EntityPublisher<TData extends object>
  extends Publisher<EntityPublisherEvent<TData>> {
  subscribe(
    entityId: string,
    callback: SubscriberCallback<EntityPublisherEvent<TData>>,
  ): void
  unsubscribe(
    entityId: string,
    callback: SubscriberCallback<EntityPublisherEvent<TData>>,
  ): void
}

export class EntityPublisherImpl<TData extends object>
  extends PublisherImpl<EntityPublisherEvent<TData>>
  implements EntityPublisher<TData> {}
