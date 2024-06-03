import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import { toast } from 'vue-sonner'

export function useSoftDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectService.softDeleteProject(id),
    onSuccess: async (_, id: string) => {
      await queryClient.invalidateQueries({
        queryKey: ['projects'],
        exact: true,
      })
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })
}
