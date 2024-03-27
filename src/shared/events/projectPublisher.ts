import { type Publisher, PublisherImpl } from '@shared/events/publisher'
import type { ProjectEntityDto } from '@shared/model/project'

export type ProjectPublisherEvent =
  | {
      type: 'updated'
      project: Readonly<ProjectEntityDto>
    }
  | {
      type: 'deleted'
      project: null
    }

export interface ProjectPublisher extends Publisher<ProjectPublisherEvent> {}

export class ProjectPublisherImpl
  extends PublisherImpl<ProjectPublisherEvent>
  implements ProjectPublisher {}
