import { type Publisher, PublisherImpl } from '@shared/events/publisher'
import type { ProjectEntityDto } from '@shared/model/project'
import type { Nullable } from '@shared/lib/utils/types'

export type ProjectPublisherEventType = 'updated' | 'deleted'

export type ProjectPublisherEvent = {
  type: ProjectPublisherEventType
  project: Readonly<Nullable<ProjectEntityDto>>
}

export interface ProjectPublisher extends Publisher<ProjectPublisherEvent> {}

export class ProjectPublisherImpl
  extends PublisherImpl<ProjectPublisherEvent>
  implements ProjectPublisher {}
