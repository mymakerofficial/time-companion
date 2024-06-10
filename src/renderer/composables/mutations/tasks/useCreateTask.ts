import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { CreateTask, TaskDto } from '@shared/model/task'
import { taskService } from '@renderer/factory/service/taskService'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

export function useCreateTask(
  options: MutationOptions<TaskDto, Partial<CreateTask>>,
) {
  return useMutation({
    mutationFn: (task: Partial<CreateTask>) => taskService.createTask(task),
    onError: options?.onError ?? handleMutationError,
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
