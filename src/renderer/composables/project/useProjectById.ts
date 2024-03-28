import { computed, type MaybeRefOrGetter, reactive, type Ref } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'
import { customRef, toValue, watch } from 'vue'
import type { Maybe, Nullable, Optional } from '@shared/lib/utils/types'
import { computedAsync, watchImmediate } from '@vueuse/core'
import { check, isAbsent, isDefined, isPresent } from '@shared/lib/utils/checks'
import {
  type EntityPublisher,
  type EntityPublisherEvent,
  getEntityChannel,
} from '@shared/events/entityPublisher'
import type { ProjectEntityDao, ProjectEntityDto } from '@shared/model/project'
import type { SubscriberCallback } from '@shared/events/publisher'
import { getOrDefault, getOrNull } from '@shared/lib/utils/result'

function entityFieldToRef<TSource extends object, TValue extends unknown>(
  field: string,
  options: {
    defaultValue: TValue
    entityId: MaybeRefOrGetter<Maybe<string>>
    initialEntity: Ref<Nullable<Readonly<TSource>>>
    publisher: EntityPublisher<TSource>
    onUpdated: (newValue: TValue) => void
  },
): Ref<TValue> {
  const { defaultValue, entityId, initialEntity, publisher, onUpdated } =
    options

  return customRef((track, trigger) => {
    let value: TValue

    function update(entity: Nullable<TSource>) {
      value = getOrDefault(
        entity?.[field as any as keyof TSource] as TValue,
        defaultValue,
      )
      trigger()
    }

    const subscriber: SubscriberCallback<EntityPublisherEvent<TSource>> = (
      event,
    ) => {
      if (event.type === 'deleted') {
        update(null)
      }

      if (
        event.type === 'updated' &&
        event.changedFields.includes(field as any as keyof TSource)
      ) {
        update(event.data)
      }
    }

    watchImmediate(
      () => toValue(entityId),
      (newValue, oldValue) => {
        if (isPresent(oldValue)) {
          publisher.unsubscribe(getEntityChannel(oldValue), subscriber)
        }

        if (isPresent(newValue)) {
          publisher.subscribe(getEntityChannel(newValue), subscriber)
        }
      },
    )

    watch(initialEntity, (newValue) => {
      update(newValue)
    })

    return {
      get() {
        track()
        return value
      },
      set(newValue: TValue) {
        onUpdated(newValue)

        // optimistic update
        value = newValue
        trigger()
      },
    }
  })
}

export function useProjectById(
  projectId: MaybeRefOrGetter<Maybe<string>>,
): ProjectEntityDao {
  const initialProject = computedAsync(async () => {
    const id = toValue(projectId)

    if (isAbsent(id)) {
      return null
    }

    return await projectService.getProjectById(id)
  })

  const displayName = entityFieldToRef<ProjectEntityDto, string>(
    'displayName',
    {
      defaultValue: '',
      entityId: projectId,
      initialEntity: initialProject,
      publisher: projectService,
      onUpdated(newValue) {
        projectService.patchProjectById(toValue(projectId)!, {
          displayName: newValue,
        })
      },
    },
  )

  const color = entityFieldToRef<ProjectEntityDto, Nullable<string>>('color', {
    defaultValue: null,
    entityId: projectId,
    initialEntity: initialProject,
    publisher: projectService,
    onUpdated(newValue) {
      projectService.patchProjectById(toValue(projectId)!, {
        color: newValue,
      })
    },
  })

  const isBillable = entityFieldToRef<ProjectEntityDto, boolean>('isBillable', {
    defaultValue: false,
    entityId: projectId,
    initialEntity: initialProject,
    publisher: projectService,
    onUpdated(newValue) {
      projectService.patchProjectById(toValue(projectId)!, {
        isBillable: newValue,
      })
    },
  })

  return reactive({
    id: computed(() => getOrNull(toValue(projectId))),
    displayName,
    color,
    isBillable,
    createdAt: computed(() => getOrNull(initialProject.value?.createdAt)),
    modifiedAt: computed(() => getOrNull(initialProject.value?.modifiedAt)),
    deletedAt: computed(() => getOrNull(initialProject.value?.deletedAt)),
  })
}
