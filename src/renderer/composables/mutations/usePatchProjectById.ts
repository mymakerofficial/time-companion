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
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: ['projects'],
        exact: true,
      })
      await queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
