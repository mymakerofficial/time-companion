import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

export function usePatchProjectById() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      project,
      id,
    }: {
      project: Partial<ProjectDto>
      id: string
    }) => projectService.patchProjectById(id, project),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
