import { type MaybeRef, toValue } from 'vue'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import { useQuery } from '@tanstack/vue-query'
import { dayService } from '@renderer/factory/service/dayService'

export function useGetDayByDate(date: MaybeRef<PlainDate>) {
  const queryKey = ['days', 'getDay', 'get', { date }]

  return useQuery({
    queryKey,
    queryFn: () => dayService.getDayByDate(toValue(date)),
  })
}
