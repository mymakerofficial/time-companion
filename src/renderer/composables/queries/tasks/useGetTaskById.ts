import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { toValue, watchEffect } from 'vue'
import { check, isUndefined } from '@shared/lib/utils/checks'
import { taskService } from '@renderer/factory/service/taskService'

export function useGetTaskById(id: MaybeRef<string>) {
  const queryClient = useQueryClient()
  const queryKey = ['tasks', id]

  watchEffect(() => {
    if (isUndefined(queryClient.getQueryData(queryKey))) {
      return
    }

    taskService.subscribe(
      {
        id: toValue(id),
        type: 'updated',
      },
      (event) => {
        check(event.type === 'updated')
        queryClient.setQueryData(queryKey, event.data)
      },
    )

    // we don't need to unsubscribe because somebody else might use the same query again
  })

  return useQuery({
    queryKey,
    queryFn: () => taskService.getTaskById(toValue(id)),
  })
}
