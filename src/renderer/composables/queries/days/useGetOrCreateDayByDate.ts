import { type MaybeRef, toValue } from 'vue'
import type { PlainDate } from '@shared/lib/datetime/plainDate'
import { useQuery } from '@tanstack/vue-query'
import { dayService } from '@renderer/factory/service/dayService'

export function useGetOrCreateDayByDate(date: MaybeRef<PlainDate>) {
  const queryKey = ['days', 'getDay', 'getOrCreate', { date }]

  return useQuery({
    queryKey,
    queryFn: () => dayService.getOrCreateDayByDate(toValue(date)),
  })
}
