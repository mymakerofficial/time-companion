import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { projectService } from '@renderer/factory/service/projectService'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watchEffect } from 'vue'
import { isUndefined } from '@shared/lib/utils/checks'
import type { Maybe } from '@shared/lib/utils/types'

export function useGetProjectById(id: MaybeRefOrGetter<Maybe<string>>) {
  const queryClient = useQueryClient()
  const queryKey = computed(() => [
    'projects',
    'getProject',
    { id: toValue(id) ?? null },
  ])

  watchEffect(() => {
    if (isUndefined(queryClient.getQueryData(toValue(queryKey)))) {
      return
    }

    projectService.subscribe({}, () => {
      queryClient.invalidateQueries({ queryKey: toValue(queryKey) }).then()
    })
  })

  return useQuery({
    queryKey,
    queryFn: () => projectService.getProjectById(toValue(id)!),
    initialData: null,
    enabled: () => !!toValue(id),
  })
}
