import type {Ref} from "vue";
import {readonly, ref} from "vue";

export interface UseInitializeReturn {
  init: () => void,
  isInitialized: Readonly<Ref<boolean>>
}

export function useInitialize(initializer: () => void): UseInitializeReturn {
  const isInitialized = ref(false)

  function init() {
    if (isInitialized.value) {
      return
    }

    initializer()

    isInitialized.value = true
  }

  return {
    init,
    isInitialized: readonly(isInitialized)
  }
}