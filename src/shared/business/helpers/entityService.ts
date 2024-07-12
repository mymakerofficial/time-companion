import {
  type EntityPublisher,
  EntityPublisherImpl,
} from '@shared/events/entityPublisher'
import type { HasId } from '@shared/model/helpers/hasId'
import type { HasModifiedAt } from '@shared/model/helpers/hasModifiedAt'

export interface EntityService<TEntity extends HasId & HasModifiedAt>
  extends EntityPublisher<TEntity> {}

export class EntityServiceImpl<TEntity extends HasId & HasModifiedAt>
  extends EntityPublisherImpl<TEntity>
  implements EntityService<TEntity>
{
  constructor() {
    super()
  }

  protected publishCreated(entity: TEntity): void {
    this.notify(
      { type: 'created', id: entity.id },
      { type: 'created', data: entity },
    )
  }

  protected publishUpdated(entity: TEntity): void {
    this.notify(
      {
        type: 'updated',
        id: entity.id,
      },
      {
        type: 'updated',
        data: entity,
      },
    )
  }

  protected publishDeleted(entityId: string): void {
    this.notify(
      { type: 'deleted', id: entityId },
      { type: 'deleted', id: entityId },
    )
  }
}
