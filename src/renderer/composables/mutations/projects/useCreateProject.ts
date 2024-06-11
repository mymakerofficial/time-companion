import { useMutation } from '@tanstack/vue-query'
import type { CreateProject, ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'
import type { MutationOptions } from '@renderer/composables/mutations/helpers/mutationOptions'

export function useCreateProject(
  options?: MutationOptions<ProjectDto, Partial<CreateProject>>,
) {
  return useMutation({
    mutationFn: (project: Partial<CreateProject>) =>
      projectService.createProject(project),
    onError: options?.onError ?? handleMutationError,
    onSuccess: options?.onSuccess,
    onSettled: options?.onSettled,
  })
}
