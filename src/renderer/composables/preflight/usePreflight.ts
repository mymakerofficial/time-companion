import { preflightService } from '@renderer/factory/service/preflightService'
import { entriesOf } from '@shared/lib/utils/object'
import { readonly, type Ref, ref } from 'vue'
import type {
  PreflightActor,
  PreflightState,
} from '@shared/service/preflightService'

export function usePreflight() {
  const actors = entriesOf(preflightService.actors).reduce(
    (acc, [actor, value]) => {
      acc[actor] = ref(value)
      return acc
    },
    {} as Record<PreflightActor, Ref<PreflightState>>,
  )

  const isReady = ref(preflightService.isReady)
  const isErrored = ref(preflightService.isErrored)

  preflightService.subscribe({}, (event) => {
    actors[event.actor].value = event.state
    isReady.value = preflightService.isReady
    isErrored.value = preflightService.isErrored
  })

  return {
    ...actors,
    isReady: readonly(isReady),
    isErrored: readonly(isErrored),
  }
}
