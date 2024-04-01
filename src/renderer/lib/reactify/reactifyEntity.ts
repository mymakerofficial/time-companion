import type { Maybe, Nullable } from '@shared/lib/utils/types'
import type {
  PublisherTopics,
  SubscriberCallback,
} from '@shared/events/publisher'
import type {
  EntityPublisher,
  EntityPublisherEvent,
  EntityPublisherTopics,
} from '@shared/events/entityPublisher'
import { customRef, type MaybeRefOrGetter, type Ref, toValue, watch } from 'vue'
import { getOrDefault } from '@shared/lib/utils/result'
import { computedAsync, toReactive, watchImmediate } from '@vueuse/core'
import { check, isAbsent, isPresent } from '@shared/lib/utils/checks'
import { entriesOf } from '@shared/lib/utils/object'
import { toString } from '@shared/lib/utils/casting'

function createSubscriber<TEntity extends object>(
  onUpdate: (newEntity: Nullable<TEntity>) => void,
): SubscriberCallback<
  EntityPublisherTopics<TEntity>,
  EntityPublisherEvent<TEntity>
> {
  return (event) => {
    if (event.type === 'deleted') {
      onUpdate(null)
    }

    if (event.type === 'updated') {
      onUpdate(event.data)
    }
  }
}

function getTopics<TEntity extends object>(
  entityId: string,
  fieldName: string,
): PublisherTopics<EntityPublisherTopics<TEntity>> {
  return {
    type: ['updated', 'deleted'],
    entityId: entityId,
    field: fieldName as any as keyof TEntity,
  }
}

export interface EntityFieldToRefOptions<
  TEntity extends object,
  TValue extends unknown,
> {
  fieldName: string
  defaultValue: TValue
  entityId: MaybeRefOrGetter<Maybe<string>>
  initialEntity: Ref<Nullable<Readonly<TEntity>>>
  publisher: EntityPublisher<TEntity>
  onChanged: (newValue: TValue) => void
}

export function entityFieldToRef<
  TEntity extends object,
  TValue extends unknown,
>(options: EntityFieldToRefOptions<TEntity, TValue>): Ref<TValue> {
  const {
    fieldName,
    defaultValue,
    entityId,
    initialEntity,
    publisher,
    onChanged,
  } = options

  return customRef((track, trigger) => {
    let value: TValue = defaultValue

    function update(entity: Nullable<TEntity>) {
      value = getOrDefault(
        entity?.[fieldName as any as keyof TEntity] as TValue,
        defaultValue,
      )
      trigger()
    }

    const subscriber = createSubscriber(update)

    // the entityId might change or not be present, so we need to dynamically subscribe and unsubscribe
    watchImmediate(
      () => toValue(entityId),
      (newId, oldId) => {
        // unsubscribe from the old entity
        if (isPresent(oldId)) {
          publisher.unsubscribe(getTopics(oldId, fieldName), subscriber)
        }

        // subscribe to the new entity
        if (isPresent(newId)) {
          publisher.subscribe(getTopics(newId, fieldName), subscriber)
        }
      },
    )

    // set the initial value
    watch(initialEntity, (newValue) => {
      update(newValue)
    })

    return {
      get() {
        track()
        return value
      },
      set(newValue: TValue) {
        onChanged(newValue)

        // optimistic update
        value = newValue
        trigger()
      },
    }
  })
}

export interface EntityToRefsOptions<TIn extends TOut, TOut extends object> {
  entityId: MaybeRefOrGetter<Maybe<string>>
  // used to subscribe to changes on the entity.
  //  each field will subscribe individually
  publisher: EntityPublisher<TIn>
  // will be used to get the initial values of the entity, and will be called each time the entityId changes
  getterFn: (id: string) => Promise<Nullable<Readonly<TIn>>>
  // will get called each time a field is updated
  patchFn: (id: string, patch: Partial<TIn>) => Promise<Readonly<TIn>>
  // the default values object is used to find all fields that should exist in the output object
  defaultValues: TOut
}

export function entityToRefs<TIn extends TOut, TOut extends object>(
  options: EntityToRefsOptions<TIn, TOut>,
): {
  [K in keyof TOut]: Ref<TOut[K]>
} {
  const { entityId, publisher, getterFn, patchFn, defaultValues } = options

  const initialEntity = computedAsync(async () => {
    const id = toValue(entityId)

    if (isAbsent(id)) {
      return null
    }

    return await getterFn(id)
  }, null)

  return entriesOf(defaultValues).reduce((acc, [fieldName, defaultValue]) => {
    acc[fieldName] = entityFieldToRef({
      fieldName: fieldName as any as string,
      defaultValue,
      entityId,
      initialEntity,
      publisher,
      onChanged(newValue) {
        const id = toValue(entityId)

        check(
          isPresent(id),
          `Tried to update field ${toString(fieldName)} on entity dao with absent id`,
        )

        patchFn(
          id,
          // @ts-expect-error shhhh it's fine
          {
            [fieldName]: newValue,
          },
        )
      },
    })

    return acc
  }, {} as any)
}

// creates a reactive object from an entity.
//  the returned dao will stay in sync with the entity in the database and all other dao's of the same entity.
//  all changes will be immediately patched to the database.
export function createEntityDao<TIn extends TOut, TOut extends object>(
  options: EntityToRefsOptions<TIn, TOut>,
): TOut {
  return toReactive(entityToRefs(options)) as TOut
}
