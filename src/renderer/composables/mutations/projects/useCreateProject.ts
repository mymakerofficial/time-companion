import { useMutation } from '@tanstack/vue-query'
import type { CreateProject } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { handleMutationError } from '@renderer/composables/mutations/helpers/handleMutationError'

export function useCreateProject() {
  return useMutation({
    mutationFn: (project: CreateProject) =>
      projectService.createProject(project),
    onError: handleMutationError,
  })
}
