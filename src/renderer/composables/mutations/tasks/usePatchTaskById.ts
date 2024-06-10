import { useMutation } from '@tanstack/vue-query'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import { taskService } from '@renderer/factory/service/taskService'
import type { UpdateProject } from '@shared/model/project'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'
import type { TaskDto } from '@shared/model/task'

export function usePatchTaskById(
  options: MutationOptions<TaskDto, Partial<UpdateProject>>,
) {
  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<UpdateProject> }) =>
      taskService.patchTaskById(id, task),
    onError: options.onError ?? handleMutationError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
  })
}
