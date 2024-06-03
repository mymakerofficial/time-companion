import { useQuery } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'

export function useGetProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  })
}
