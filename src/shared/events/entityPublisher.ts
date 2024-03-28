import { type Publisher, PublisherImpl } from '@shared/events/publisher'

export type EntityPublisherUpdateEvent<TData extends object> = {
  type: 'updated'
  data: Readonly<TData>
  changedFields: ReadonlyArray<keyof TData>
}

export type EntityPublisherDeleteEvent = {
  type: 'deleted'
  id: string
}

export type EntityPublisherEvent<TData extends object> =
  | EntityPublisherUpdateEvent<TData>
  | EntityPublisherDeleteEvent

export interface EntityPublisher<TData extends object>
  extends Publisher<EntityPublisherEvent<TData>> {}

export class EntityPublisherImpl<TData extends object>
  extends PublisherImpl<EntityPublisherEvent<TData>>
  implements EntityPublisher<TData> {}

export function getEntityChannel(key: string) {
  return `entity:${key}`
}
