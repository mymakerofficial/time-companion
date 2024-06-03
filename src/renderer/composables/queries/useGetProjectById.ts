import { useQuery } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'

export function useGetProjectById(id: MaybeRef<string>) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getProjectById(toValue(id)),
  })
}
