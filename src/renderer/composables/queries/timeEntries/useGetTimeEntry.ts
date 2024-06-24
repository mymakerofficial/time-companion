import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watchEffect } from 'vue'
import { check, isUndefined } from '@shared/lib/utils/checks'
import type { Maybe } from '@shared/lib/utils/types'
import { timeEntryService } from '@renderer/factory/service/timeEntryService'

export function useGetTimeEntry(id: MaybeRefOrGetter<Maybe<string>>) {
  const queryClient = useQueryClient()
  const queryKey = computed(() => [
    'timeEntries',
    'getTimeEntry',
    { id: toValue(id) ?? null },
  ])

  watchEffect(() => {
    if (isUndefined(queryClient.getQueryData(toValue(queryKey)))) {
      return
    }

    timeEntryService.subscribe(
      {
        id: toValue(id),
        type: 'updated',
      },
      (event) => {
        check(event.type === 'updated')
        queryClient.setQueryData(toValue(queryKey), event.data)
      },
    )
  })

  return useQuery({
    queryKey,
    queryFn: () => timeEntryService.getTimeEntryById(toValue(id)!),
    initialData: null,
    enabled: () => !!toValue(id),
  })
}
