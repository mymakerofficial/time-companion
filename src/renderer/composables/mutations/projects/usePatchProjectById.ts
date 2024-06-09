import { useMutation } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'

export function usePatchProjectById() {
  return useMutation({
    mutationFn: ({
      project,
      id,
    }: {
      project: Partial<ProjectDto>
      id: string
    }) => projectService.patchProjectById(id, project),
    onError: handleMutationError,
  })
}