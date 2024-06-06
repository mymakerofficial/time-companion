import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { TaskDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'

export function useCreateTask() {
  return useMutation({
    mutationFn: (task: TaskDto) => taskService.createTask(task),
    onError: handleMutationError,
  })
}
