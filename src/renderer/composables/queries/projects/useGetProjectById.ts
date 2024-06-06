import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import type { MaybeRef } from 'vue'
import { toValue, watchEffect } from 'vue'
import { check, isUndefined } from '@shared/lib/utils/checks'

export function useGetProjectById(id: MaybeRef<string>) {
  const queryClient = useQueryClient()
  const queryKey = ['projects', id]

  watchEffect(() => {
    if (isUndefined(queryClient.getQueryData(queryKey))) {
      return
    }

    projectService.subscribe(
      {
        entityId: toValue(id),
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
    queryFn: () => projectService.getProjectById(toValue(id)),
  })
}
