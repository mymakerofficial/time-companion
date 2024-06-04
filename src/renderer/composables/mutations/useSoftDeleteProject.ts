import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

export function useSoftDeleteProject() {
  return useMutation({
    mutationFn: (id: string) => projectService.softDeleteProject(id),
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
