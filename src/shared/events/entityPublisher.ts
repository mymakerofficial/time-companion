import { type Publisher, PublisherImpl } from '@shared/events/publisher'

export type EntityNotificationType = 'updated' | 'deleted' | 'created'

export type EntityPublisherTopics<TData extends object> = {
  type: EntityNotificationType
  entityId: string
  field: keyof TData
}

export type EntityPublisherUpdateEvent<TData extends object> = {
  type: 'updated'
  data: Readonly<TData>
  changedFields: ReadonlyArray<keyof TData>
}

export type EntityPublisherDeleteEvent = {
  type: 'deleted'
  id: string
}

export type EntityPublisherCreateEvent<TData extends object> = {
  type: 'created'
  data: Readonly<TData>
}

export type EntityPublisherEvent<TData extends object> =
  | EntityPublisherUpdateEvent<TData>
  | EntityPublisherDeleteEvent
  | EntityPublisherCreateEvent<TData>

export interface EntityPublisher<TData extends object>
  extends Publisher<
    EntityPublisherTopics<TData>,
    EntityPublisherEvent<TData>
  > {}

export class EntityPublisherImpl<TData extends object>
  extends PublisherImpl<
    EntityPublisherTopics<TData>,
    EntityPublisherEvent<TData>
  >
  implements EntityPublisher<TData> {}
