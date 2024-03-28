import type { MaybeRefOrGetter, Ref } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'
import { customRef, toValue, watch } from 'vue'
import type { Optional } from '@shared/lib/utils/types'
import { computedAsync, toReactive } from '@vueuse/core'
import { check, isNotNull } from '@shared/lib/utils/checks'
import { getEntityChannel } from '@shared/events/entityPublisher'
import type { ProjectEntityDao } from '@shared/model/project'

export function useProjectById(
  projectIdSource: MaybeRefOrGetter<string>,
): ProjectEntityDao {
  const projectId = toValue(projectIdSource)

  const initialProject = computedAsync(async () => {
    return await projectService.getProjectById(toValue(projectIdSource))
  })

  const displayName: Ref<Optional<string>> = customRef((track, trigger) => {
    let value: Optional<string>

    projectService.subscribe(getEntityChannel(projectId), (event) => {
      if (event.type !== 'updated') {
        return
      }

      if (event.changedFields.includes('displayName')) {
        value = event.data.displayName
        trigger()
      }
    })

    watch(initialProject, (newValue) => {
      value = newValue?.displayName
      trigger()
    })

    return {
      get() {
        track()
        return value
      },
      set(newValue: Optional<string>) {
        check(isNotNull(newValue), 'displayName must not be null')

        projectService
          .patchProjectById(projectId, {
            displayName: newValue,
          })
          .then()
      },
    }
  })

  return toReactive({
    displayName,
  })
}
