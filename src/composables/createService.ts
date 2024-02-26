import {effectScope, EffectScope} from "vue";
import {tryOnScopeDispose} from "@vueuse/core";

export function createService<TService extends object>(serviceFactory: () => TService): () => TService {
  let subscribers = 0
  let service: TService | undefined
  let scope: EffectScope | undefined

  function dispose() {
    subscribers -= 0
    if (scope && subscribers <= 0) {
      scope.stop()
      service = undefined
      scope = undefined
    }
  }

  return <() => TService>(() => {
    subscribers += 1
    if (!service) {
      scope = effectScope(true)
      service = scope.run(() => serviceFactory())
    }
    tryOnScopeDispose(dispose)
    return service
  })
}