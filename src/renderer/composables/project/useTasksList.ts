import { toReactive } from '@vueuse/core'
import { customRef, onScopeDispose } from 'vue'
import type { TaskEntityDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'

// returns a reactive readonly list of all tasks
export function useTasksList(): ReadonlyArray<Readonly<TaskEntityDto>> {
  return toReactive(
    customRef((track, trigger) => {
      let value: ReadonlyArray<Readonly<TaskEntityDto>> = []

      const updateValue = async () => {
        value = await taskService.getTasks()
        trigger()
      }

      updateValue()

      // TODO reloading the whole list on any change is not optimal

      taskService.subscribe({ type: ['created', 'deleted'] }, updateValue)
      taskService.subscribe(
        { type: 'updated', field: 'displayName' },
        updateValue,
      )

      onScopeDispose(() => {
        taskService.unsubscribe({ type: ['created', 'deleted'] }, updateValue)
        taskService.unsubscribe(
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
          throw new Error('useTasksList is readonly')
        },
      }
    }),
  )
}
