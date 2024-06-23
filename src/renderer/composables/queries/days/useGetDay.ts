import { type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { dayService } from '@renderer/factory/service/dayService'

export function useGetDay(id: MaybeRef<string>) {
  const queryKey = ['days', 'getDay', 'get', { id }]

  return useQuery({
    queryKey,
    queryFn: () => dayService.getDayById(toValue(id)),
    initialData: null,
  })
}
