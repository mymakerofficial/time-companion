import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (project: ProjectDto) => projectService.createProject(project),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
