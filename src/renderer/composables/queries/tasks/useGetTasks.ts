import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isUndefined } from '@shared/lib/utils/checks'
import { taskService } from '@renderer/factory/service/taskService'

export function useGetTasks() {
  const queryClient = useQueryClient()
  const queryKey = ['tasks']

  if (isUndefined(queryClient.getQueryData(queryKey))) {
    taskService.subscribe({}, () => {
      queryClient.invalidateQueries({ queryKey, exact: true })
    })
  }

  return useQuery({
    queryKey,
    queryFn: () => taskService.getTasks(),
    initialData: [],
  })
}
