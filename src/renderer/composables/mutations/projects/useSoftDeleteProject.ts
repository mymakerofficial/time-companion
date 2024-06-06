import { useMutation } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'

export function useSoftDeleteProject() {
  return useMutation({
    mutationFn: (id: string) => projectService.softDeleteProject(id),
    onError: handleMutationError,
  })
}
