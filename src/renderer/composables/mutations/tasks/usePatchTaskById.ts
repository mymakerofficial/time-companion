import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import type { TaskDto, UpdateTask } from '@shared/model/task'

type UsePatchTaskByIdVariables = {
  task: Partial<UpdateTask>
  id: string
}

export function usePatchTaskById(
  options?: MutationOptions<TaskDto, UsePatchTaskByIdVariables>,
) {
  return useMutation({
    mutationFn: ({ id, task }: UsePatchTaskByIdVariables) =>
      taskService.patchTaskById(id, task),
    onError: options?.onError ?? handleMutationError,
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
