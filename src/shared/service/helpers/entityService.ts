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
      { type: 'created', entityId: entity.id },
      { type: 'created', data: entity },
    )
  }

  protected publishUpdated(
    entity: TEntity,
    changedFields: ReadonlyArray<keyof TEntity>,
  ): void {
    this.notify(
      {
        type: 'updated',
        entityId: entity.id,
        field: [...changedFields, 'modifiedAt'],
      },
      {
        type: 'updated',
        data: entity,
        changedFields: changedFields,
      },
    )
  }

  protected publishDeleted(entityId: string): void {
    this.notify(
      { type: 'deleted', entityId: entityId },
      { type: 'deleted', id: entityId },
    )
  }
}
