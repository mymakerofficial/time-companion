import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProjectDto } from '@shared/model/project'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

export function useCreateProject() {
  return useMutation({
    mutationFn: (project: ProjectDto) => projectService.createProject(project),
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
