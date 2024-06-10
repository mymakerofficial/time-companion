import { type Publisher, PublisherImpl } from '@shared/events/publisher'

export type EntityNotificationType = 'updated' | 'deleted' | 'created'

export type EntityPublisherTopics = {
  type: EntityNotificationType
  id: string
}

export type EntityPublisherUpdateEvent<TData extends object> = {
  type: 'updated'
  data: TData
}

export type EntityPublisherDeleteEvent = {
  type: 'deleted'
  id: string
}

export type EntityPublisherCreateEvent<TData extends object> = {
  type: 'created'
  data: TData
}

export type EntityPublisherEvent<TData extends object> =
  | EntityPublisherUpdateEvent<TData>
  | EntityPublisherDeleteEvent
  | EntityPublisherCreateEvent<TData>

export interface EntityPublisher<TData extends object>
  extends Publisher<EntityPublisherTopics, EntityPublisherEvent<TData>> {}

export class EntityPublisherImpl<TData extends object>
  extends PublisherImpl<EntityPublisherTopics, EntityPublisherEvent<TData>>
  implements EntityPublisher<TData> {}
