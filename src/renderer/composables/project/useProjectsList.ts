import type { ProjectEntityDto } from '@shared/model/project'
import { toReactive } from '@vueuse/core'
import { customRef, onScopeDispose } from 'vue'
import { projectService } from '@renderer/factory/service/projectService'

// returns a reactive readonly list of all projects
export function useProjectsList(): ReadonlyArray<Readonly<ProjectEntityDto>> {
  return toReactive(
    customRef((track, trigger) => {
      let value: ReadonlyArray<Readonly<ProjectEntityDto>> = []

      const updateValue = async () => {
        value = await projectService.getProjects()
        trigger()
      }

      updateValue()

      // TODO reloading the whole list on any change is not optimal

      projectService.subscribe({ type: ['created', 'deleted'] }, updateValue)
      projectService.subscribe(
        { type: 'updated', field: 'displayName' },
        updateValue,
      )

      onScopeDispose(() => {
        projectService.unsubscribe(
          { type: ['created', 'deleted'] },
          updateValue,
        )
        projectService.unsubscribe(
          { type: 'updated', field: 'displayName' },
          updateValue,
        )
      })

      return {
        get() {
          track()
          return value
        },
        set() {
          trigger()
          throw new Error('useProjectsList is readonly')
        },
      }
    }),
  )
}
