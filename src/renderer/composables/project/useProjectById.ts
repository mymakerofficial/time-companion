import type { MaybeRefOrGetter, Ref } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'
import { customRef, toValue, watch } from 'vue'
import type { Maybe, Nullable } from '@shared/lib/utils/types'
import { computedAsync, toReactive, watchImmediate } from '@vueuse/core'
import { check, isAbsent, isPresent } from '@shared/lib/utils/checks'
import {
  type EntityPublisher,
  type EntityPublisherEvent,
  getEntityChannel,
} from '@shared/events/entityPublisher'
import type { ProjectEntityDao, ProjectEntityDto } from '@shared/model/project'
import type { SubscriberCallback } from '@shared/events/publisher'
import { getOrDefault } from '@shared/lib/utils/result'
import { entriesOf } from '@shared/lib/utils/object'
import { toString } from '@shared/lib/utils/casting'

function createSubscriber<TEntity extends object>(
  fieldName: string,
  onUpdate: (newEntity: Nullable<TEntity>) => void,
): SubscriberCallback<EntityPublisherEvent<TEntity>> {
  return (event) => {
    if (event.type === 'deleted') {
      onUpdate(null)
    }

    if (
      event.type === 'updated' &&
      event.changedFields.includes(fieldName as any as keyof TEntity)
    ) {
      onUpdate(event.data)
    }
  }
}

interface EntityFieldToRefOptions<
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

function entityFieldToRef<TEntity extends object, TValue extends unknown>(
  options: EntityFieldToRefOptions<TEntity, TValue>,
): Ref<TValue> {
  const {
    fieldName,
    defaultValue,
    entityId,
    initialEntity,
    publisher,
    onChanged,
  } = options

  return customRef((track, trigger) => {
    let value: TValue

    function update(entity: Nullable<TEntity>) {
      value = getOrDefault(
        entity?.[fieldName as any as keyof TEntity] as TValue,
        defaultValue,
      )
      trigger()
    }

    const subscriber = createSubscriber(fieldName, update)

    // the entityId might change or not be present, so we need to dynamically subscribe and unsubscribe
    watchImmediate(
      () => toValue(entityId),
      (newValue, oldValue) => {
        // unsubscribe from the old entity
        if (isPresent(oldValue)) {
          publisher.unsubscribe(getEntityChannel(oldValue), subscriber)
        }

        // subscribe to the new entity
        if (isPresent(newValue)) {
          publisher.subscribe(getEntityChannel(newValue), subscriber)
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

interface EntityToRefsOptions<TIn extends TOut, TOut extends object> {
  entityId: MaybeRefOrGetter<Maybe<string>>
  publisher: EntityPublisher<TIn>
  getterFn: (id: string) => Promise<Nullable<Readonly<TIn>>>
  patchFn: (id: string, patch: Partial<TIn>) => Promise<Readonly<TIn>>
  // the object returned will only contain fields that are present in the defaultValues object
  defaultValues: Partial<TOut>
}

function entityToRefs<TIn extends TOut, TOut extends object>(
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
          // @ts-expect-error
          {
            [fieldName]: newValue,
          },
        )
      },
    })

    return acc
  }, {} as any)
}

export function useProjectById(
  projectId: MaybeRefOrGetter<Maybe<string>>,
): ProjectEntityDao {
  return toReactive(
    entityToRefs<ProjectEntityDto, ProjectEntityDao>({
      entityId: projectId,
      publisher: projectService,
      getterFn: projectService.getProjectById,
      patchFn: projectService.patchProjectById,
      defaultValues: {
        id: null,
        displayName: '',
        color: null,
        isBillable: false,
        createdAt: null,
        modifiedAt: null,
        deletedAt: null,
      },
    }),
  )
}
