import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import { isUndefined } from '@shared/lib/utils/checks'

export function useGetProjects() {
  const queryClient = useQueryClient()
  const queryKey = ['projects', 'getProjects']

  if (isUndefined(queryClient.getQueryData(queryKey))) {
    projectService.subscribe({}, () => {
      queryClient.invalidateQueries({ queryKey, exact: true }).then()
    })
  }

  return useQuery({
    queryKey,
    queryFn: () => projectService.getProjects(),
    initialData: [],
  })
}
