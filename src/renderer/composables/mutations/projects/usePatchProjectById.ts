import { useMutation } from '@tanstack/vue-query'
import type { ProjectDto, UpdateProject } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

type UsePatchProjectByIdVariables = {
  project: Partial<UpdateProject>
  id: string
}

export function usePatchProjectById(
  options: MutationOptions<ProjectDto, UsePatchProjectByIdVariables>,
) {
  return useMutation({
    mutationFn: ({ project, id }: UsePatchProjectByIdVariables) =>
      projectService.patchProjectById(id, project),
    onError: options.onError ?? handleMutationError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
  })
}
