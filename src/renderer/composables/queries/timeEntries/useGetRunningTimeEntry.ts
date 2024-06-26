import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isUndefined } from '@shared/lib/utils/checks'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

export function useGetRunningTimeEntry() {
  const queryClient = useQueryClient()
  const queryKey = ['timeEntries', 'getRunningTimeEntry']

  if (isUndefined(queryClient.getQueryData(queryKey))) {
    timeEntryService.subscribe({}, () => {
      queryClient
        .invalidateQueries({
          queryKey,
        })
        .then()
    })
  }

  return useQuery({
    queryKey,
    queryFn: () => timeEntryService.getRunningTimeEntry(),
    initialData: null,
  })
}
