import { createService } from '@renderer/composables/createService'
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'vue-sonner'

export interface PwaService {}

export const usePwaService = createService<PwaService>(() => {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast('Update available! Reload?', {
        action: {
          label: 'Reload',
          onClick: () => updateSW(true),
        },
        cancel: {
          label: 'Ask Later',
        },
        duration: Infinity,
      })
    },
    onOfflineReady() {
      toast('App is ready for offline use!')
    },
  })

  return {}
})
