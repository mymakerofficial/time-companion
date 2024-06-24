import { type MaybeRef, toValue, watchEffect } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isDefined } from '@shared/lib/utils/checks'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'
import type { Maybe } from '@shared/lib/utils/types'

export function useGetTimeEntriesByDay(dayId: MaybeRef<Maybe<string>>) {
  const queryClient = useQueryClient()
  const queryKey = ['timeEntries', 'getTimeEntries', { dayId }]

  watchEffect(() => {
    if (isDefined(queryClient.getQueryData(queryKey))) {
      return
    }

    timeEntryService.subscribe({}, () => {
      queryClient
        .invalidateQueries({
          queryKey: ['timeEntries', 'getTimeEntries', { dayId }],
        })
        .then()
    })
  })

  return useQuery({
    queryKey,
    queryFn: () => timeEntryService.getTimeEntriesByDayId(toValue(dayId)!),
    initialData: [],
    enabled: !!toValue(dayId),
  })
}
